import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(key, {
      apiVersion: '2026-02-25.clover',
    })
  }
  return stripeInstance
}

export const STRIPE_CONFIG = {
  get proPriceId() {
    const id = process.env.STRIPE_PRO_PRICE_ID
    if (!id) throw new Error('STRIPE_PRO_PRICE_ID is not configured')
    return id
  },
  get webhookSecret() {
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
    return secret
  },
}

export async function createCheckoutSession(
  customerId: string | undefined,
  userId: string,
  email: string
): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    customer: customerId || undefined,
    customer_email: customerId ? undefined : email,
    client_reference_id: userId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: STRIPE_CONFIG.proPriceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?payment=cancelled`,
    metadata: {
      userId,
    },
  })

  return session.url!
}

export async function createCustomerPortalSession(
  customerId: string
): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  return session.url
}

export async function getSubscription(subscriptionId: string) {
  return getStripe().subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string) {
  return getStripe().subscriptions.cancel(subscriptionId)
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    STRIPE_CONFIG.webhookSecret
  )
}
