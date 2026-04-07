export const prerender = false;

import type { APIRoute } from 'astro';
import { stripe, CONNECTED_ACCOUNT_ID, PLATFORM_FEE_PERCENT, SITE_URL } from '../../lib/stripe';
import products from '../../data/products.json';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { slug, format, quantity = 1, size } = await request.json();

    // Find product
    const product = products.find((p: any) => p.slug === slug);
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    // Find format
    const formatData = product.formats.find((f: any) => f.type === format);
    if (!formatData || !formatData.available) {
      return new Response(JSON.stringify({ error: 'Format not available' }), { status: 400 });
    }

    // Calculate fee (prices are in dollars, Stripe wants cents)
    const unitAmount = Math.round(formatData.price * 100);
    const totalAmount = unitAmount * quantity;
    const applicationFee = Math.round(totalAmount * (PLATFORM_FEE_PERCENT / 100));

    // Format label
    const formatLabel = format === 'tee' ? 'T-Shirt' : format === 'print' ? 'Print' : format === 'poster' ? 'Poster Print' : 'Original';
    const productName = `${product.title} \u2014 ${formatLabel}`;

    // POD items need shipping address
    const needsShipping = format === 'print' || format === 'tee' || format === 'poster';

    // Build session config
    const sessionConfig: any = {
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: formatData.detail,
              images: [`${SITE_URL}${product.image}-card.jpg`],
            },
            unit_amount: unitAmount,
          },
          quantity,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: CONNECTED_ACCOUNT_ID,
        },
      },
      metadata: {
        slug,
        format,
        artist: 'mikey-ennen',
        ...(size ? { size } : {}),
      },
      success_url: `${SITE_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/shop/${slug}`,
    };

    // Add shipping for POD and originals
    if (needsShipping || format === 'original') {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US', 'CA'],
      };
    }

    // Create Stripe Checkout Session
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
