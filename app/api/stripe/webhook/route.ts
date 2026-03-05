import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, getSubscription } from '@/lib/stripe'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

let supabaseInstance: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('Supabase credentials are not configured')
    }
    supabaseInstance = createClient(url, key)
  }
  return supabaseInstance
}

function logWebhook(event: string, data: Record<string, unknown>) {
  console.log(`[WEBHOOK] ${event}:`, JSON.stringify(data))
}

async function isEventAlreadyProcessed(supabase: SupabaseClient, eventId: string): Promise<boolean> {
  const { data } = await supabase
    .from('stripe_webhook_events')
    .select('event_id')
    .eq('event_id', eventId)
    .maybeSingle()
  return data !== null
}

async function markEventProcessed(supabase: SupabaseClient, eventId: string, eventType: string): Promise<void> {
  await supabase
    .from('stripe_webhook_events')
    .insert({ event_id: eventId, event_type: eventType })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const supabase = getSupabase()
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      logWebhook('ERROR', { message: 'Missing stripe-signature header' })
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event
    try {
      event = constructWebhookEvent(payload, signature)
      logWebhook('VERIFIED', {
        eventId: event.id,
        type: event.type,
        accountId: event.account,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      logWebhook('SIGNATURE_ERROR', { message, signaturePresent: true })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Idempotency: skip events we have already processed
    if (await isEventAlreadyProcessed(supabase, event.id)) {
      logWebhook('DUPLICATE_EVENT', { eventId: event.id, type: event.type })
      return NextResponse.json({ received: true })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id ?? session.metadata?.userId
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        logWebhook('CHECKOUT_COMPLETED', { userId, customerId, subscriptionId })

        if (userId) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              is_pro: true,
              is_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)

          if (profileError) {
            logWebhook('PROFILE_UPDATE_ERROR', { userId, error: profileError.message })
          }

          // Fetch the real subscription from Stripe to get accurate period dates
          let periodStart = new Date().toISOString()
          let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          if (subscriptionId) {
            try {
              const stripeSub = await getSubscription(subscriptionId)
              const item = stripeSub.items.data[0]
              if (item) {
                periodStart = new Date(item.current_period_start * 1000).toISOString()
                periodEnd = new Date(item.current_period_end * 1000).toISOString()
              }
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Unknown error'
              logWebhook('SUBSCRIPTION_FETCH_ERROR', { subscriptionId, error: message })
            }
          }

          const { error: subError } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            plan: 'pro',
            status: 'active',
            provider: 'stripe',
            provider_customer_id: customerId,
            provider_subscription_id: subscriptionId,
            current_period_start: periodStart,
            current_period_end: periodEnd,
          }, { onConflict: 'user_id' })

          if (subError) {
            logWebhook('SUBSCRIPTION_UPSERT_ERROR', { userId, error: subError.message })
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const status = subscription.status
        const periodEnd = subscription.items.data[0]?.current_period_end
          ?? Math.floor(Date.now() / 1000 + 30 * 24 * 60 * 60)

        logWebhook('SUBSCRIPTION_UPDATED', { customerId, status })

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('provider_customer_id', customerId)
          .single()

        if (subData) {
          if (status === 'active' || status === 'trialing') {
            await supabase
              .from('profiles')
              .update({ is_pro: true })
              .eq('user_id', subData.user_id)
          } else if (status === 'past_due') {
            logWebhook('SUBSCRIPTION_PAST_DUE', { userId: subData.user_id })
          } else if (status === 'canceled' || status === 'unpaid') {
            await supabase
              .from('profiles')
              .update({ is_pro: false })
              .eq('user_id', subData.user_id)
          }

          // Map all Stripe statuses to valid DB enum values:
          // trialing → active (user has full Pro access)
          // unpaid → past_due (grace period, not yet canceled)
          const dbStatus = status === 'active' || status === 'trialing' ? 'active'
            : status === 'past_due' || status === 'unpaid' ? 'past_due'
            : status === 'canceled' ? 'canceled'
            : 'inactive'

          await supabase
            .from('subscriptions')
            .update({
              status: dbStatus,
              current_period_end: new Date(periodEnd * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('provider_customer_id', customerId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        logWebhook('SUBSCRIPTION_DELETED', { customerId })

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('provider_customer_id', customerId)
          .single()

        if (subData) {
          await supabase
            .from('profiles')
            .update({ is_pro: false })
            .eq('user_id', subData.user_id)
        }

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('provider_customer_id', customerId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const attemptCount = invoice.attempt_count

        logWebhook('PAYMENT_FAILED', { customerId, attemptCount })

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('provider_customer_id', customerId)
          .single()

        if (subData) {
          // Always mark the subscription as past_due on any failure
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('provider_customer_id', customerId)

          // Revoke Pro only after the final retry attempt
          if (attemptCount >= 3) {
            logWebhook('PAYMENT_FAILED_FINAL', { userId: subData.user_id })
            await supabase
              .from('profiles')
              .update({ is_pro: false })
              .eq('user_id', subData.user_id)
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        logWebhook('PAYMENT_SUCCEEDED', { customerId })

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id, status')
          .eq('provider_customer_id', customerId)
          .single()

        if (subData) {
          // Restore Pro if it was revoked due to a past failed payment
          await supabase
            .from('profiles')
            .update({ is_pro: true })
            .eq('user_id', subData.user_id)

          await supabase
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('provider_customer_id', customerId)
        }
        break
      }

      default:
        logWebhook('UNHANDLED_EVENT', { type: event.type })
    }

    await markEventProcessed(supabase, event.id, event.type)

    const duration = Date.now() - startTime
    logWebhook('SUCCESS', { type: event.type, duration: `${duration}ms` })

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    logWebhook('FATAL_ERROR', { message, stack })
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
