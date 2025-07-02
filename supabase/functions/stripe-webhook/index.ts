import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const encoder = new TextEncoder();
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
function parseStripeSignature(header) {
  return header.split(',').reduce((acc, item)=>{
    const [key, value] = item.split('=');
    acc[key] = value;
    return acc;
  }, {});
}
async function verifySignature(payload, header, secret) {
  const sig = parseStripeSignature(header);
  const timestamp = sig.t;
  const expectedSig = sig.v1;
  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {
    name: 'HMAC',
    hash: 'SHA-256'
  }, false, [
    'sign'
  ]);
  const signatureArrayBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const signatureHex = Array.from(new Uint8Array(signatureArrayBuffer)).map((b)=>b.toString(16).padStart(2, '0')).join('');
  return signatureHex === expectedSig;
}
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!signature || !webhookSecret) {
      return new Response('Missing signature or webhook secret', {
        status: 400,
        headers: corsHeaders
      });
    }
    const body = await req.text();
    const isValid = await verifySignature(body, signature, webhookSecret);
    if (!isValid) {
      return new Response('Invalid signature', {
        status: 400,
        headers: corsHeaders
      });
    }
    const event = JSON.parse(body);
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    switch(event.type){
      case 'checkout.session.completed':
        {
          const session = event.data.object;
          const userId = session.metadata?.userId;
          const purpose = session.metadata?.purpose;
          if (!userId || session.payment_status !== 'paid') break;
          if (purpose === 'wallet_topup') {
            const amount = parseFloat(session.metadata.amount);
            const { data: wallet, error: fetchError } = await supabase.from('wallets').select('balance').eq('user_id', userId).single();
            if (fetchError || !wallet) {
              console.error('Error fetching wallet:', fetchError);
              return new Response('Wallet fetch failed', {
                status: 500,
                headers: corsHeaders
              });
            }
            const newBalance = parseFloat(wallet.balance) + amount;
            const { error } = await supabase.from('wallets').update({
              balance: newBalance
            }).eq('user_id', userId);
            if (error) {
              return new Response('Wallet update failed', {
                status: 500,
                headers: corsHeaders
              });
            }
          }
          if (purpose === 'subscription') {
            const { error } = await supabase.from('user_profiles').update({
              subscription_status: 'pro'
            }).eq('user_id', userId);
            if (error) {
              return new Response('Subscription update failed', {
                status: 500,
                headers: corsHeaders
              });
            }
          }
          break;
        }
      case 'customer.subscription.updated':
        {
          const sub = event.data.object;
          const userId = sub.metadata?.userId;
          const status = sub.status === 'active' ? 'pro' : 'free';
          if (userId) {
            await supabase.from('user_profiles').update({
              subscription_status: status
            }).eq('user_id', userId);
          }
          break;
        }
      case 'customer.subscription.deleted':
        {
          const sub = event.data.object;
          const userId = sub.metadata?.userId;
          if (userId) {
            await supabase.from('user_profiles').update({
              subscription_status: 'free'
            }).eq('user_id', userId);
          }
          break;
        }
      case 'payment_intent.payment_failed':
        {
          const paymentIntent = event.data.object;
          console.log('Payment failed:', paymentIntent.id);
          break;
        }
      default:
        console.log('Unhandled event type:', event.type);
    }
    return new Response(JSON.stringify({
      received: true
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Webhook error', {
      status: 500,
      headers: corsHeaders
    });
  }
});
