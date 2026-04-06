import Stripe from 'stripe';

export const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const CONNECTED_ACCOUNT_ID = import.meta.env.MIKEY_CONNECTED_ACCOUNT_ID;
export const PLATFORM_FEE_PERCENT = Number(import.meta.env.PLATFORM_FEE_PERCENT || 10);
export const SITE_URL = import.meta.env.SITE_URL || 'http://localhost:4321';
