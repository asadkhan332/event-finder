// Supabase Edge Function: send-notification-email
// Sends email notifications using Resend API

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  notification_id: string
  user_email: string
  user_name: string | null
  notification_type: 'reminder' | 'confirmation' | 'update' | 'cancellation'
  title: string
  message: string
  event_title?: string
  event_date?: string
  event_time?: string
  event_location?: string
}

interface EmailResult {
  success: boolean
  notification_id: string
  error?: string
}

// Email templates for each notification type (T031)
function getEmailTemplate(req: EmailRequest): { subject: string; html: string; text: string } {
  const userName = req.user_name || 'Event Finder User'

  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
      .header { background: linear-gradient(135deg, #f97316 0%, #fbbf24 100%); padding: 32px 24px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
      .content { padding: 32px 24px; }
      .event-card { background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }
      .event-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 12px 0; }
      .event-detail { display: flex; align-items: center; margin: 8px 0; color: #6b7280; font-size: 14px; }
      .button { display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
      .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; }
    </style>
  `

  const typeColors: Record<string, { bg: string; icon: string }> = {
    reminder: { bg: '#fef3c7', icon: '🔔' },
    confirmation: { bg: '#d1fae5', icon: '✅' },
    update: { bg: '#dbeafe', icon: '📝' },
    cancellation: { bg: '#fee2e2', icon: '❌' },
  }

  const typeConfig = typeColors[req.notification_type] || typeColors.reminder

  const eventCardHtml = req.event_title ? `
    <div class="event-card">
      <p class="event-title">${req.event_title}</p>
      ${req.event_date ? `<p class="event-detail">📅 ${req.event_date}</p>` : ''}
      ${req.event_time ? `<p class="event-detail">🕐 ${req.event_time}</p>` : ''}
      ${req.event_location ? `<p class="event-detail">📍 ${req.event_location}</p>` : ''}
    </div>
  ` : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${typeConfig.icon} ${req.title}</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>${req.message}</p>
          ${eventCardHtml}
          <a href="${Deno.env.get('SITE_URL') || 'https://event-finder.app'}/notifications" class="button">View Notifications</a>
        </div>
        <div class="footer">
          <p>You're receiving this email because you have email notifications enabled.</p>
          <p>To change your notification preferences, visit your <a href="${Deno.env.get('SITE_URL') || 'https://event-finder.app'}/profile/settings">settings</a>.</p>
          <p>&copy; ${new Date().getFullYear()} Local Event Finder</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
${req.title}

Hi ${userName},

${req.message}

${req.event_title ? `Event: ${req.event_title}` : ''}
${req.event_date ? `Date: ${req.event_date}` : ''}
${req.event_time ? `Time: ${req.event_time}` : ''}
${req.event_location ? `Location: ${req.event_location}` : ''}

View all notifications: ${Deno.env.get('SITE_URL') || 'https://event-finder.app'}/notifications

---
You're receiving this email because you have email notifications enabled.
To change your preferences, visit: ${Deno.env.get('SITE_URL') || 'https://event-finder.app'}/profile/settings
  `.trim()

  return {
    subject: req.title,
    html,
    text
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const emailRequest: EmailRequest = await req.json()

    // Get email template
    const { subject, html, text } = getEmailTemplate(emailRequest)

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('EMAIL_FROM') || 'Event Finder <notifications@event-finder.app>',
        to: emailRequest.user_email,
        subject,
        html,
        text,
      }),
    })

    if (!resendResponse.ok) {
      const error = await resendResponse.text()
      console.error('Resend API error:', error)
      throw new Error(`Failed to send email: ${error}`)
    }

    // Update notification email_sent status
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    await supabase
      .from('notifications')
      .update({ email_sent: true })
      .eq('id', emailRequest.notification_id)

    console.log(`Email sent successfully for notification ${emailRequest.notification_id}`)

    return new Response(
      JSON.stringify({
        success: true,
        notification_id: emailRequest.notification_id
      } as EmailResult),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (err) {
    console.error('Error sending email:', err)
    return new Response(
      JSON.stringify({
        success: false,
        notification_id: '',
        error: err instanceof Error ? err.message : 'Unknown error'
      } as EmailResult),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
