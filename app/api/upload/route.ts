import { NextRequest } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { withRateLimit } from '@/lib/rate-limit'
import { ApiError, handleSupabaseError, handleCloudinaryError } from '@/lib/api-error'
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

  const { data: { user }, error: sessionError } = await supabase.auth.getUser()

  if (sessionError || !user) {
    throw ApiError.unauthorized('Please sign in to upload images.')
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    throw ApiError.badRequest('Invalid request format.')
  }

  const file = formData.get('file') as File | null
  const folder = formData.get('folder') as string || 'thread-creator'

  if (!file) {
    throw ApiError.badRequest('No file provided. Please select an image to upload.')
  }

  if (!file.type.startsWith('image/')) {
    throw ApiError.badRequest(
      'Invalid file type. Please upload an image (JPEG, PNG, or GIF).',
      { allowedTypes: ['image/jpeg', 'image/png', 'image/gif'] }
    )
  }

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw ApiError.badRequest(
      `File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`,
      { maxSize: '10MB', actualSize: file.size }
    )
  }

  try {
    const result = await uploadImage(file, folder)
    return successResponse(result)
  } catch (cloudinaryError: any) {
    throw handleCloudinaryError(cloudinaryError)
  }
}

async function wrappedPost(request: NextRequest) {
  try {
    return await handlePost(request)
  } catch (error) {
    return errorResponse(error)
  }
}

export const POST = withRateLimit(wrappedPost, { maxRequests: 20, windowMs: 60000 })
