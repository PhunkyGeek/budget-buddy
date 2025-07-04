/*
  # Stripe Checkout Session Creation Edge Function

  This function creates a Stripe Checkout Session for adding funds to the wallet.
  It uses Stripe's hosted checkout page for secure payment processing.
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CheckoutSessionRequest {
  amount: number
  currency?: string
  userId: string
  callbackOrigin: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { amount, currency = 'usd', userId, callbackOrigin }: CheckoutSessionRequest = await req.json()

    if (!amount || !userId || amount <= 0 || !callbackOrigin) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid amount, userId, or callbackOrigin' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate amount limits
    if (amount < 1 || amount > 10000) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Amount must be between $1.00 and $10,000.00' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Stripe not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client to verify user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify user exists
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('email, first_name, last_name')
      .eq('user_id', userId)
      .single()

    if (userError || !userProfile) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User not found' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Construct dynamic callback URLs using the provided origin
    const successUrl = `${callbackOrigin}/stripe-callback?session_id={CHECKOUT_SESSION_ID}&status=success`
    const cancelUrl = `${callbackOrigin}/stripe-callback?status=cancelled`

    console.log('Creating Stripe checkout session with URLs:', {
      successUrl,
      cancelUrl,
      callbackOrigin
    })

    // Create Checkout Session with Stripe using dynamic URLs
    const checkoutSessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        mode: 'payment',
        'line_items[0][price_data][currency]': currency,
        'line_items[0][price_data][product_data][name]': 'Budget Buddy Wallet Top-up',
        'line_items[0][price_data][product_data][description]': `Add $${amount.toFixed(2)} to your Budget Buddy wallet`,
        'line_items[0][price_data][unit_amount]': (amount * 100).toString(), // Convert to cents
        'line_items[0][quantity]': '1',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userProfile.email,
        'metadata[userId]': userId,
        'metadata[purpose]': 'wallet_topup',
        'metadata[amount]': amount.toString(),
        'payment_intent_data[description]': `Budget Buddy wallet top-up for ${userProfile.first_name} ${userProfile.last_name}`,
        'payment_intent_data[receipt_email]': userProfile.email,
        'payment_intent_data[metadata][userId]': userId,
        'payment_intent_data[metadata][purpose]': 'wallet_topup',
        billing_address_collection: 'required',
        'automatic_tax[enabled]': 'false',
        allow_promotion_codes: 'false'
      }),
    })

    if (!checkoutSessionResponse.ok) {
      const errorData = await checkoutSessionResponse.text()
      console.error('Stripe API error:', errorData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create checkout session' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const checkoutSession = await checkoutSessionResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        sessionUrl: checkoutSession.url,
        sessionId: checkoutSession.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})