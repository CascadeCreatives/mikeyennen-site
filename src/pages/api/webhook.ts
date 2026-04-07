export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createPrintfulOrder, type PrintfulAddress } from '../../lib/printful';
import { PRINT_VARIANT_ID, getTeeVariantId, getPrintFileUrl } from '../../lib/printful-variants';

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
    const { slug, format, size } = session.metadata || {};

    console.log(`✅ Payment received: ${slug} (${format}${size ? `, ${size}` : ''}) — $${(session.amount_total || 0) / 100}`);

    // ── Originals: notify artist ───────────────────────────────────────────────
    if (format === 'original') {
      // TODO: Send email notification to Mikey
      // Suggested: Resend or Formspree email trigger
      console.log(`📧 Notify artist: original "${slug}" sold`);
      const addr = session.shipping_details?.address;
      if (addr) {
        console.log(`   Ship to: ${session.shipping_details?.name}, ${addr.line1}, ${addr.city} ${addr.state} ${addr.postal_code} ${addr.country}`);
      }
    }

    // ── POD (poster / print / tee): auto-create Printful order ─────────────────
    if (format === 'poster' || format === 'print' || format === 'tee') {
      try {
        await handlePrintfulOrder({ session, slug, format, size });
      } catch (err: any) {
        // Log but don't return 500 — Stripe already confirmed the payment.
        // Failed orders should be retried / handled manually.
        console.error(`❌ Printful order failed for ${slug} (${format}):`, err.message);
        // TODO: Alert yourself here (email, Slack, etc.) so no order slips through
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};

// ─── Printful order creation ──────────────────────────────────────────────────

async function handlePrintfulOrder({
  session,
  slug,
  format,
  size,
}: {
  session: Stripe.Checkout.Session;
  slug: string;
  format: string;
  size?: string;
}) {
  // 1. Build shipping address from Stripe session
  const stripeAddr = session.shipping_details?.address;
  const stripeName = session.shipping_details?.name;

  if (!stripeAddr || !stripeName) {
    throw new Error(`No shipping address on session ${session.id}`);
  }

  const recipient: PrintfulAddress = {
    name: stripeName,
    address1: stripeAddr.line1 || '',
    address2: stripeAddr.line2 || undefined,
    city: stripeAddr.city || '',
    state_code: stripeAddr.state || '',
    country_code: stripeAddr.country || 'US',
    zip: stripeAddr.postal_code || '',
    email: session.customer_details?.email || undefined,
  };

  // 2. Resolve variant ID
  let variantId: number;
  if (format === 'print' || format === 'poster') {
    variantId = PRINT_VARIANT_ID;
  } else if (format === 'tee') {
    if (!size) throw new Error(`Tee order for "${slug}" is missing size in metadata`);
    variantId = getTeeVariantId(size);
  } else {
    throw new Error(`Unexpected format "${format}" in Printful handler`);
  }

  // 3. Resolve print file URL
  const fileFormat = format === 'poster' ? 'print' : format;
  const fileUrl = getPrintFileUrl(slug, fileFormat as 'print' | 'tee');
  if (!fileUrl) {
    throw new Error(
      `No print file configured for slug "${slug}" / format "${format}". ` +
      `Add it to src/lib/printful-variants.ts → PRINT_FILE_URLS.`
    );
  }

  // 4. Create Printful order
  const itemName = format === 'poster'
    ? `${slug} — Enhanced Matte Poster 12×16"`
    : format === 'print'
      ? `${slug} — Archival Print 12×16"`
      : `${slug} — Bella+Canvas 3001 Tee (${size})`;

  await createPrintfulOrder({
    recipient,
    items: [
      {
        variant_id: variantId,
        quantity: 1,
        name: itemName,
        retail_price: String((session.amount_total || 0) / 100),
        files: [
          {
            type: 'default',
            url: fileUrl,
            filename: `${slug}-${format}.${format === 'tee' ? 'png' : 'jpg'}`,
          },
        ],
      },
    ],
    retail_costs: {
      total: String((session.amount_total || 0) / 100),
    },
  });
}
