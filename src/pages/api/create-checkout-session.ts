export const prerender = false;

import type { APIRoute } from 'astro';
import { stripe, CONNECTED_ACCOUNT_ID, PLATFORM_FEE_PERCENT, SITE_URL } from '../../lib/stripe';
import products from '../../data/products.json';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Support both single-item (legacy) and multi-item (cart) requests
    const items = body.items || [{ slug: body.slug, format: body.format, quantity: body.quantity || 1, size: body.size, colorway: body.colorway }];

    const lineItems: any[] = [];
    let totalAmount = 0;
    let needsShipping = false;
    const metaSlugs: string[] = [];

    for (const item of items) {
      const product = (products as any[]).find((p) => p.slug === item.slug);
      if (!product) {
        return new Response(JSON.stringify({ error: `Product not found: ${item.slug}` }), { status: 404 });
      }

      const formatData = product.formats.find((f: any) => f.type === item.format);
      if (!formatData || !formatData.available) {
        return new Response(JSON.stringify({ error: `Format not available: ${item.slug} ${item.format}` }), { status: 400 });
      }

      const unitAmount = Math.round(formatData.price * 100);
      const qty = item.quantity || 1;
      totalAmount += unitAmount * qty;

      const formatLabel = item.format === 'tee' ? 'T-Shirt' : item.format === 'print' ? 'Print' : item.format === 'poster' ? 'Poster Print' : 'Original';
      let productName = `${product.title} — ${formatLabel}`;
      if (item.colorway) productName += ` (${item.colorway})`;
      if (item.size) productName += ` [${item.size}]`;

      if (['print', 'tee', 'poster', 'original'].includes(item.format)) {
        needsShipping = true;
      }

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: productName,
            description: formatData.detail,
            images: [`${SITE_URL}${product.image}-card.jpg`],
          },
          unit_amount: unitAmount,
        },
        quantity: qty,
      });

      metaSlugs.push(`${item.slug}:${item.format}${item.size ? ':' + item.size : ''}${item.colorway ? ':' + item.colorway : ''}`);
    }

    const applicationFee = Math.round(totalAmount * (PLATFORM_FEE_PERCENT / 100));

    const sessionConfig: any = {
      mode: 'payment',
      line_items: lineItems,
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: CONNECTED_ACCOUNT_ID,
        },
      },
      metadata: {
        items: metaSlugs.join('|'),
        artist: 'mikey-ennen',
        item_count: String(items.length),
      },
      success_url: `${SITE_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/shop`,
    };

    if (needsShipping) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US', 'CA'],
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
