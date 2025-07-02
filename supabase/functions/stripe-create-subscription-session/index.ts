/*
  # Stripe Subscription Checkout Session Creation Edge Function

  This function creates a Stripe Checkout Session for Pro subscriptions.
  It uses Stripe's hosted checkout page for secure subscription processing.
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SubscriptionCheckoutRequest {
  userId: string
  stripeProductId: string
  callbackOrigin: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, stripeProductId, callbackOrigin }: SubscriptionCheckoutRequest = await req.json()

    if (!userId || !stripeProductId || !callbackOrigin) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing userId, stripeProductId, or callbackOrigin' 
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

    // Get the product and its prices from Stripe
    const productResponse = await fetch(`https://api.stripe.com/v1/products/${stripeProductId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      },
    })

    if (!productResponse.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Product not found in Stripe' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get prices for the product
    const pricesResponse = await fetch(`https://api.stripe.com/v1/prices?product=${stripeProductId}&active=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      },
    })

    if (!pricesResponse.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No prices found for product' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const pricesData = await pricesResponse.json()
    
    if (!pricesData.data || pricesData.data.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No active prices found for product' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use the first active price (you might want to add logic to select specific price)
    const priceId = pricesData.data[0].id

    // Construct dynamic callback URLs using the provided origin
    const successUrl = `${callbackOrigin}/subscription-callback?session_id={CHECKOUT_SESSION_ID}&status=success`
    const cancelUrl = `${callbackOrigin}/subscription-callback?status=cancelled`

    console.log('Creating Stripe subscription checkout session with URLs:', {
      successUrl,
      cancelUrl,
      callbackOrigin,
      priceId
    })

    // Create Checkout Session with Stripe for subscription
    const checkoutSessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        mode: 'subscription',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userProfile.email,
        'metadata[userId]': userId,
        'metadata[purpose]': 'subscription',
        'metadata[productId]': stripeProductId,
        'subscription_data[description]': `Budget Buddy Pro subscription for ${userProfile.first_name} ${userProfile.last_name}`,
        'subscription_data[metadata][userId]': userId,
        'subscription_data[metadata][purpose]': 'subscription',
        billing_address_collection: 'required',
        'automatic_tax[enabled]': 'false',
        allow_promotion_codes: 'true'
      }),
    })

    if (!checkoutSessionResponse.ok) {
      const errorData = await checkoutSessionResponse.text()
      console.error('Stripe API error:', errorData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create subscription checkout session' 
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
    console.error('Error creating subscription checkout session:', error)
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