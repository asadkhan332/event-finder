// Supabase Edge Function: schedule-reminders
// Triggered by pg_cron every 15 minutes to send event reminders

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReminderResult {
  success: boolean
  reminders_sent: number
  error?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Call the database function to schedule reminders
    const { data, error } = await supabase.rpc('schedule_event_reminders')

    if (error) {
      console.error('Error scheduling reminders:', error)
      return new Response(
        JSON.stringify({
          success: false,
          reminders_sent: 0,
          error: error.message
        } as ReminderResult),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const reminderCount = data as number

    console.log(`Successfully scheduled ${reminderCount} reminder(s)`)

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: reminderCount
      } as ReminderResult),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({
        success: false,
        reminders_sent: 0,
        error: err instanceof Error ? err.message : 'Unknown error'
      } as ReminderResult),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
