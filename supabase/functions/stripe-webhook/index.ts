/*
  # Stripe Webhook Handler Edge Function

  This function handles Stripe webhooks to update wallet balances
  when checkout sessions are completed successfully.
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!signature || !webhookSecret) {
      return new Response('Missing signature or webhook secret', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    const body = await req.text()
    
    // Verify webhook signature
    const crypto = await import('node:crypto')
    const elements = signature.split(',')
    const signatureElements = elements.reduce((acc, element) => {
      const [key, value] = element.split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const timestamp = signatureElements.t
    const signatures = [signatureElements.v1]

    const payload = timestamp + '.' + body
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload, 'utf8')
      .digest('hex')

    const isSignatureValid = signatures.some(sig => 
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(sig, 'hex')
      )
    )

    if (!isSignatureValid) {
      return new Response('Invalid signature', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    const event = JSON.parse(body)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        const userId = session.metadata.userId
        const amount = parseFloat(session.metadata.amount)
        
        if (!userId || !amount) {
          console.error('Missing userId or amount in checkout session metadata')
          break
        }

        // Ensure the payment was successful
        if (session.payment_status !== 'paid') {
          console.error('Checkout session completed but payment not successful:', session.payment_status)
          break
        }

        // Update wallet balance
        const { error: walletError } = await supabase
          .from('wallets')
          .update({
            balance: supabase.raw(`balance + ${amount}`)
          })
          .eq('user_id', userId)

        if (walletError) {
          console.error('Error updating wallet balance:', walletError)
          return new Response('Error updating wallet', { 
            status: 500,
            headers: corsHeaders 
          })
        }

        console.log(`Successfully added $${amount} to wallet for user ${userId} via checkout session ${session.id}`)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        console.log('Payment failed:', failedPayment.id, failedPayment.last_payment_error?.message)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})