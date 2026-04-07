/**
 * Printful API client for Cascade Creatives
 * Each artist site sets PRINTFUL_STORE_ID in their own Vercel env vars.
 * All sites share the same PRINTFUL_API_KEY (account-level token).
 * Docs: https://developers.printful.com/docs/
 */

const PRINTFUL_API_BASE = 'https://api.printful.com';

function getApiKey(): string {
  const key = import.meta.env.PRINTFUL_API_KEY;
  if (!key) throw new Error('PRINTFUL_API_KEY env var is not set');
  return key;
}

function getStoreId(): string {
  const id = import.meta.env.PRINTFUL_STORE_ID;
  if (!id) throw new Error('PRINTFUL_STORE_ID env var is not set');
  return id;
}

async function printfulFetch(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${PRINTFUL_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'X-PF-Store-Id': getStoreId(),
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const json = await res.json();

  if (!res.ok) {
    const msg = json?.error?.message || json?.result || `Printful API error ${res.status}`;
    throw new Error(`Printful ${res.status}: ${msg}`);
  }

  return json.result;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrintfulAddress {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state_code: string;   // e.g. "WA"
  country_code: string; // e.g. "US"
  zip: string;
  phone?: string;
  email?: string;
}

export interface PrintfulOrderItem {
  variant_id: number;   // Printful's internal variant ID
  quantity: number;
  name: string;         // shown on packing slip
  retail_price?: string; // for customs declarations
  files: PrintfulFile[];
}

export interface PrintfulFile {
  type: 'default' | 'back' | 'label'; // 'default' = front/main
  url: string;                          // publicly accessible URL
  filename?: string;
}

export interface CreateOrderPayload {
  recipient: PrintfulAddress;
  items: PrintfulOrderItem[];
  retail_costs?: {
    shipping?: string;
    subtotal?: string;
    total?: string;
  };
}

// ─── Main exports ─────────────────────────────────────────────────────────────

export async function createPrintfulOrder(payload: CreateOrderPayload): Promise<{ id: number; status: string }> {
  console.log('🖨️  Creating Printful order for store', getStoreId(), JSON.stringify(payload, null, 2));
  const result = await printfulFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  console.log(`✅ Printful order created: #${result.id} (${result.status})`);
  return { id: result.id, status: result.status };
}

export async function getPrintfulOrder(orderId: number): Promise<any> {
  return printfulFetch(`/orders/${orderId}`);
}
