import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('Supabase credentials are not configured')
    }
    supabaseInstance = createClient(url, key)
  }
  return supabaseInstance as any
}

function logWebhook(event: string, data: Record<string, any>) {
  console.log(`[WEBHOOK] ${event}:`, JSON.stringify(data))
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const supabase = getSupabase()
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')!

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
        accountId: event.account 
      })
    } catch (err: any) {
      logWebhook('SIGNATURE_ERROR', { 
        message: err.message,
        signaturePresent: !!signature 
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.client_reference_id || session.metadata?.userId
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

          const { error: subError } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            plan: 'pro',
            status: 'active',
            provider: 'stripe',
            provider_customer_id: customerId,
            provider_subscription_id: subscriptionId,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
        const periodEnd = subscription.items.data[0]?.current_period_end || Math.floor(Date.now() / 1000 + 30 * 24 * 60 * 60)

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
              .update({ is_pro: true, is_verified: true })
              .eq('user_id', subData.user_id)
          } else if (status === 'past_due') {
            logWebhook('SUBSCRIPTION_PAST_DUE', { userId: subData.user_id })
          } else if (status === 'canceled' || status === 'unpaid') {
            await supabase
              .from('profiles')
              .update({ is_pro: false, is_verified: false })
              .eq('user_id', subData.user_id)
          }

          const dbStatus = status === 'active' ? 'active' 
            : status === 'past_due' ? 'past_due'
            : status === 'canceled' ? 'canceled'
            : 'inactive'

          await supabase
            .from('subscriptions')
            .update({
              status: dbStatus,
              current_period_end: new Date(periodEnd * 1000).toISOString(),
            })
            .eq('provider_customer_id', customerId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
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
            .update({
              is_pro: false,
              is_verified: false,
            })
            .eq('user_id', subData.user_id)
        }

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('provider_customer_id', customerId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer as string
        const attemptCount = invoice.attempt_count

        logWebhook('PAYMENT_FAILED', { customerId, attemptCount })

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('provider_customer_id', customerId)
          .single()

        if (subData && attemptCount >= 3) {
          logWebhook('PAYMENT_FAILED_FINAL', { userId: subData.user_id })
          await supabase
            .from('profiles')
            .update({ is_pro: false, is_verified: false })
            .eq('user_id', subData.user_id)
        }
        break
      }

      default:
        logWebhook('UNHANDLED_EVENT', { type: event.type })
    }

    const duration = Date.now() - startTime
    logWebhook('SUCCESS', { type: event.type, duration: `${duration}ms` })

    return NextResponse.json({ received: true })
  } catch (error: any) {
    logWebhook('FATAL_ERROR', { message: error.message, stack: error.stack })
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
