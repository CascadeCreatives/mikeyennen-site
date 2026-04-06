export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { slug, format, artist } = session.metadata || {};

    console.log(`✅ Payment received: ${slug} (${format}) — $${(session.amount_total || 0) / 100}`);

    // POD items (print, tee) → trigger Printful
    if (format === 'print' || format === 'tee') {
      // TODO: Call Printful API to create order
      // Requires: PRINTFUL_API_KEY, shipping address from session
      console.log(`🖨️ POD fulfillment needed for ${slug} (${format})`);
    }

    // Originals → notify artist
    if (format === 'original') {
      // TODO: Send email notification to artist
      console.log(`📧 Notify artist: original "${slug}" sold`);
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};
