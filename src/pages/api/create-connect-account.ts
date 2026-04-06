export const prerender = false;

import type { APIRoute } from 'astro';
import { stripe, SITE_URL } from '../../lib/stripe';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, artist_name } = await request.json();

    // Create Express connected account
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        artist_name,
        platform: 'cascade-creatives',
      },
    });

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${SITE_URL}/api/create-connect-account`,
      return_url: `${SITE_URL}/connect/success`,
      type: 'account_onboarding',
    });

    return new Response(
      JSON.stringify({
        account_id: account.id,
        onboarding_url: accountLink.url,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Connect account error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
