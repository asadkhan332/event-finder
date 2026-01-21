/**
 * Get the base URL for the application
 * Works in all environments: production, preview, and local development
 */
export const getURL = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Vercel production link
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Vercel preview/temporary link
    'http://localhost:3000/' // Local development

  // Ensure URL has correct protocol
  url = url.includes('http') ? url : `https://${url}`

  // Ensure URL ends with trailing slash
  url = url.endsWith('/') ? url : `${url}/`

  return url
}
