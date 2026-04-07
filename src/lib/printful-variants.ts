/**
 * Printful variant ID mapping
 *
 * HOW TO GET REAL IDs (one-time setup per product):
 *   GET https://api.printful.com/products  → find the product
 *   GET https://api.printful.com/products/{id} → list all variants with their IDs
 *
 * Or use the Printful dashboard → Products → find variant IDs in the URL / detail page.
 *
 * ─── PRINTS ──────────────────────────────────────────────────────────────────
 * Product: Enhanced Matte Paper Poster (in) — Printful product ID: 1
 * Size: 12×16" → variant you need to confirm in your dashboard
 *
 * ─── TEES ────────────────────────────────────────────────────────────────────
 * Product: Bella + Canvas 3001 Unisex Jersey Short Sleeve Tee — Printful product ID: 71
 * Size variants (all DTG, White unless Mikey wants color):
 *   S=4011, M=4012, L=4013, XL=4014, 2XL=4015
 *   (These are real Printful variant IDs for BC 3001 White — confirm in your dashboard)
 *
 * ─── FILE URLS ───────────────────────────────────────────────────────────────
 * Printful pulls print files from a public URL at order time.
 * Store high-res files in Vercel Blob, S3, Cloudflare R2, or a /public subfolder.
 * Minimum resolution: 150 DPI at print size (print: 1800×2400px, tee: 4500×5400px for DTG)
 */

export type TeeSize = 'S' | 'M' | 'L' | 'XL' | '2XL';

// ─── Tee variant IDs (Bella+Canvas 3001, White, DTG) ──────────────────────────
// ⚠️  Verify these against: GET /products/71 in your Printful account
export const TEE_VARIANT_IDS: Record<TeeSize, number> = {
  S:   4011,
  M:   4012,
  L:   4013,
  XL:  4014,
  '2XL': 4015,
};

// ─── Print variant ID (Enhanced Matte Paper Poster 12×16") ────────────────────
// ⚠️  Confirm by running: GET /products/1 or check Printful dashboard
export const PRINT_VARIANT_ID = 9818; // Enhanced Matte Paper Poster (in) — 12×16"

// ─── High-res file URLs ───────────────────────────────────────────────────────
// Map each slug to its print-ready file URL.
// These need to be publicly accessible (Vercel Blob, S3, R2, etc.)
// Format: slug → { print?: string, tee?: string }
//
// PLACEHOLDER: replace these with real hosted URLs before going live.
// The /public/art/ images are card-sized JPEGs — NOT print resolution.
// Mikey needs to provide high-res files for each product.

const BASE_PRINT_FILES_URL = 'https://mikeyennen-site.vercel.app/print-files';

export const PRINT_FILE_URLS: Record<string, { print?: string; tee?: string }> = {
  'ravens-teal-wood':      { print: `${BASE_PRINT_FILES_URL}/ravens-teal-wood-print.jpg`,      tee: `${BASE_PRINT_FILES_URL}/ravens-teal-wood-tee.png` },
  'ice-cave':              { print: `${BASE_PRINT_FILES_URL}/ice-cave-print.jpg` },
  'kraken':                { print: `${BASE_PRINT_FILES_URL}/kraken-print.jpg`,                tee: `${BASE_PRINT_FILES_URL}/kraken-tee.png` },
  'mountain-treeline-teal':{ print: `${BASE_PRINT_FILES_URL}/mountain-treeline-teal-print.jpg`,tee: `${BASE_PRINT_FILES_URL}/mountain-treeline-teal-tee.png` },
  'sasquatch-green':       { print: `${BASE_PRINT_FILES_URL}/sasquatch-green-print.jpg`,       tee: `${BASE_PRINT_FILES_URL}/sasquatch-green-tee.png` },
  'sasquatch-neon':        { print: `${BASE_PRINT_FILES_URL}/sasquatch-neon-print.jpg` },
  'sasquatch-ochre':       { print: `${BASE_PRINT_FILES_URL}/sasquatch-ochre-print.jpg` },
  'sasquatch-tan':         { print: `${BASE_PRINT_FILES_URL}/sasquatch-tan-print.jpg` },
  'sasquatch-silver':      { print: `${BASE_PRINT_FILES_URL}/sasquatch-silver-print.jpg` },
  'ravens-blue-print':     { print: `${BASE_PRINT_FILES_URL}/ravens-blue-print-print.jpg`,     tee: `${BASE_PRINT_FILES_URL}/ravens-blue-print-tee.png` },
  'baker-trees-bw':        { print: `${BASE_PRINT_FILES_URL}/baker-trees-bw-print.jpg`,        tee: `${BASE_PRINT_FILES_URL}/baker-trees-bw-tee.png` },
  'baker-trees-grey':      { print: `${BASE_PRINT_FILES_URL}/baker-trees-grey-print.jpg` },
  'mt-shuksan-trees':      { print: `${BASE_PRINT_FILES_URL}/mt-shuksan-trees-print.jpg`,      tee: `${BASE_PRINT_FILES_URL}/mt-shuksan-trees-tee.png` },
  'ravenwood':             { print: `${BASE_PRINT_FILES_URL}/ravenwood-print.jpg`,             tee: `${BASE_PRINT_FILES_URL}/ravenwood-tee.png` },
  'tree-blue':             { print: `${BASE_PRINT_FILES_URL}/tree-blue-print.jpg`,             tee: `${BASE_PRINT_FILES_URL}/tree-blue-tee.png` },
  'salmon-run':            { print: `${BASE_PRINT_FILES_URL}/salmon-run-print.jpg`,            tee: `${BASE_PRINT_FILES_URL}/salmon-run-tee.png` },
  'waterfall-teal':        { print: `${BASE_PRINT_FILES_URL}/waterfall-teal-print.jpg` },
  'island-rocks':          { print: `${BASE_PRINT_FILES_URL}/island-rocks-print.jpg` },
  'shoe-tree':             { print: `${BASE_PRINT_FILES_URL}/shoe-tree-print.jpg`,             tee: `${BASE_PRINT_FILES_URL}/shoe-tree-tee.png` },
  'ravenwood-yellow':      { print: `${BASE_PRINT_FILES_URL}/ravenwood-yellow-print.jpg` },
  'old-growth-canopy':     { print: `${BASE_PRINT_FILES_URL}/old-growth-canopy-print.jpg`,     tee: `${BASE_PRINT_FILES_URL}/old-growth-canopy-tee.png` },
  'water-reflections':     { print: `${BASE_PRINT_FILES_URL}/water-reflections-print.jpg` },
  'mountain-ridge':        { print: `${BASE_PRINT_FILES_URL}/mountain-ridge-print.jpg` },
  'bird-abstract-teal':    { print: `${BASE_PRINT_FILES_URL}/bird-abstract-teal-print.jpg` },
  'mountain-flow-blue':    { print: `${BASE_PRINT_FILES_URL}/mountain-flow-blue-print.jpg` },
  'fishing-vessel':        { print: `${BASE_PRINT_FILES_URL}/fishing-vessel-print.jpg`,        tee: `${BASE_PRINT_FILES_URL}/fishing-vessel-tee.png` },
  'octopus-painting':      { print: `${BASE_PRINT_FILES_URL}/octopus-painting-print.jpg`,      tee: `${BASE_PRINT_FILES_URL}/octopus-painting-tee.png` },
  'lbs-blue-1':            { print: `${BASE_PRINT_FILES_URL}/lbs-blue-1-print.jpg`,            tee: `${BASE_PRINT_FILES_URL}/lbs-blue-1-tee.png` },
  'gravity-rasta':         { print: `${BASE_PRINT_FILES_URL}/gravity-rasta-print.jpg`,         tee: `${BASE_PRINT_FILES_URL}/gravity-rasta-tee.png` },
  'ravens-dark-blue-hr':   { print: `${BASE_PRINT_FILES_URL}/ravens-dark-blue-hr-print.jpg`,   tee: `${BASE_PRINT_FILES_URL}/ravens-dark-blue-hr-tee.png` },
  'ravens-dark-green':     { print: `${BASE_PRINT_FILES_URL}/ravens-dark-green-print.jpg` },
  'ravens-light-teal':     { print: `${BASE_PRINT_FILES_URL}/ravens-light-teal-print.jpg` },
  'tradition':             { print: `${BASE_PRINT_FILES_URL}/tradition-print.jpg`,             tee: `${BASE_PRINT_FILES_URL}/tradition-tee.png` },
  'waterfall-bw':          { print: `${BASE_PRINT_FILES_URL}/waterfall-bw-print.jpg` },
};

/**
 * Get the Printful variant ID for a tee order.
 * Throws if size is missing or unrecognised.
 */
export function getTeeVariantId(size: string): number {
  const id = TEE_VARIANT_IDS[size as TeeSize];
  if (!id) throw new Error(`Unknown tee size: "${size}". Valid: S, M, L, XL, 2XL`);
  return id;
}

/**
 * Get the print file URL for a given slug and format.
 * Returns null if not yet configured (prevents order creation with bad file).
 */
export function getPrintFileUrl(slug: string, format: 'print' | 'tee'): string | null {
  return PRINT_FILE_URLS[slug]?.[format] ?? null;
}
