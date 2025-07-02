/*
  # Stripe Webhook Handler Edge Function

  This function handles Stripe webhooks to update wallet balances
  and subscription statuses when payments are completed successfully.
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.6.0?target=deno'

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
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const signature = req.headers.get('stripe-signature')

    if (!stripeSecretKey || !webhookSecret || !signature) {
      return new Response('Missing Stripe configuration or signature', {
        status: 400,
        headers: corsHeaders
      })
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-04-10', // Use your actual Stripe API version
    })

    const body = await req.text()

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('⚠️  Webhook signature verification failed:', err.message)
      return new Response('Webhook signature invalid', {
        status: 400,
        headers: corsHeaders
      })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        const userId = session.metadata.userId
        const purpose = session.metadata.purpose

        if (!userId) {
          console.error('Missing userId in checkout session metadata')
          break
        }

        // Ensure the payment was successful
        if (session.payment_status !== 'paid') {
          console.error('Checkout session completed but payment not successful:', session.payment_status)
          break
        }

        if (purpose === 'wallet_topup') {
          const amount = parseFloat(session.metadata.amount)
          if (!amount) {
            console.error('Missing amount in wallet top-up checkout session metadata')
            break
          }

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

          console.log(`✅ Added $${amount} to wallet for user ${userId} via session ${session.id}`)
        } else if (purpose === 'subscription') {
          const { error: subscriptionError } = await supabase
            .from('user_profiles')
            .update({
              subscription_status: 'pro'
            })
            .eq('user_id', userId)

          if (subscriptionError) {
            console.error('Error updating subscription status:', subscriptionError)
            return new Response('Error updating subscription', {
              status: 500,
              headers: corsHeaders
            })
          }

          console.log(`✅ Activated Pro subscription for user ${userId} via session ${session.id}`)
        }
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object
        const subscriptionUserId = updatedSubscription.metadata?.userId

        if (subscriptionUserId) {
          const isActive = updatedSubscription.status === 'active'
          const subscriptionStatus = isActive ? 'pro' : 'free'

          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              subscription_status: subscriptionStatus
            })
            .eq('user_id', subscriptionUserId)

          if (updateError) {
            console.error('Error updating subscription status on update:', updateError)
          } else {
            console.log(`✅ Updated subscription to ${subscriptionStatus} for user ${subscriptionUserId}`)
          }
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        const deletedUserId = deletedSubscription.metadata?.userId

        if (deletedUserId) {
          const { error: deleteError } = await supabase
            .from('user_profiles')
            .update({
              subscription_status: 'free'
            })
            .eq('user_id', deletedUserId)

          if (deleteError) {
            console.error('Error updating subscription status on deletion:', deleteError)
          } else {
            console.log(`✅ Set subscription to free for user ${deletedUserId}`)
          }
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        console.log('❌ Payment failed:', failedPayment.id, failedPayment.last_payment_error?.message)
        break

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook error', {
      status: 500,
      headers: corsHeaders
    })
  }
})
