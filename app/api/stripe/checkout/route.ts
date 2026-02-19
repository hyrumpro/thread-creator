import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, createCustomerPortalSession } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { withRateLimit } from '@/lib/rate-limit'
import { ApiError, handleSupabaseError, handleStripeError } from '@/lib/api-error'
import { successResponse, errorResponse } from '@/lib/api-response'

async function handlePost(request: NextRequest) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw ApiError.unauthorized('Please sign in to continue.')
  }

  const userId = session.user.id
  const email = session.user.email

  if (!email) {
    throw ApiError.badRequest('Email address is required for checkout.')
  }

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('provider_customer_id')
    .eq('user_id', userId)
    .single()

  if (subError && subError.code !== 'PGRST116') {
    throw handleSupabaseError(subError)
  }

  try {
    const checkoutUrl = await createCheckoutSession(
      subscription?.provider_customer_id || null,
      userId,
      email
    )
    return successResponse({ url: checkoutUrl })
  } catch (stripeError: any) {
    throw handleStripeError(stripeError)
  }
}

async function handleGet(request: NextRequest) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw ApiError.unauthorized('Please sign in to continue.')
  }

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('provider_customer_id, status')
    .eq('user_id', session.user.id)
    .single()

  if (subError) {
    if (subError.code === 'PGRST116') {
      throw ApiError.notFound('No active subscription found. Please subscribe first.')
    }
    throw handleSupabaseError(subError)
  }

  if (!subscription?.provider_customer_id) {
    throw ApiError.badRequest('No customer account found. Please contact support.')
  }

  try {
    const portalUrl = await createCustomerPortalSession(subscription.provider_customer_id)
    return successResponse({ url: portalUrl })
  } catch (stripeError: any) {
    throw handleStripeError(stripeError)
  }
}

async function wrappedPost(request: NextRequest) {
  try {
    return await handlePost(request)
  } catch (error) {
    return errorResponse(error)
  }
}

async function wrappedGet(request: NextRequest) {
  try {
    return await handleGet(request)
  } catch (error) {
    return errorResponse(error)
  }
}

export const POST = withRateLimit(wrappedPost, { maxRequests: 10, windowMs: 60000 })
export const GET = withRateLimit(wrappedGet, { maxRequests: 10, windowMs: 60000 })
