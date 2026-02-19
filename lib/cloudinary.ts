import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'

let isConfigured = false

function configureCloudinary() {
  if (isConfigured) return
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured')
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })
  
  isConfigured = true
}

export async function uploadImage(
  file: File,
  folder: string = 'thread-creator'
): Promise<{ url: string; publicId: string }> {
  configureCloudinary()
  
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Upload failed'))
            return
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          })
        }
      )
      .end(buffer)
  })
}

export async function deleteImage(publicId: string): Promise<void> {
  configureCloudinary()
  await cloudinary.uploader.destroy(publicId)
}

export function getOptimizedUrl(
  url: string,
  options?: {
    width?: number
    height?: number
    quality?: string
  }
): string {
  if (!url.includes('cloudinary.com')) return url

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) return url

  const transformations = []
  if (options?.width) transformations.push(`w_${options.width}`)
  if (options?.height) transformations.push(`h_${options.height}`)
  if (options?.quality) transformations.push(`q_${options.quality}`)

  if (transformations.length === 0) return url

  return url.replace(
    `/upload/`,
    `/upload/${transformations.join(',')}/`
  )
}
