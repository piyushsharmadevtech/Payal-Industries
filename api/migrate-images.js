import { kv } from '@vercel/kv';
import { put } from '@vercel/blob';

function parseDataUrl(dataUrl) {
  const match = /^data:(.+);base64,(.*)$/.exec(dataUrl || '');
  if (!match) return null;
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const ext = mimeType.split('/')[1] || 'jpg';
  return { buffer, mimeType, ext };
}

async function uploadIfBase64(value) {
  if (!value || typeof value !== 'string' || !value.startsWith('data:')) {
    return value; // already a URL (or empty) — leave as is
  }
  const parsed = parseDataUrl(value);
  if (!parsed) return value;
  const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${parsed.ext}`;
  const blob = await put(filename, parsed.buffer, {
    access: 'public',
    contentType: parsed.mimeType
  });
  return blob.url;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const products = (await kv.get('products')) || [];
    let migratedImages = 0;
    let droppedLegacyFields = 0;

    const updated = [];
    for (const p of products) {
      const product = { ...p };

      // Convert any legacy base64 entries inside the images gallery array to
      // Blob URLs instead of dropping the field — it's actively used now.
      if (Array.isArray(product.images)) {
        const cleaned = [];
        for (const img of product.images) {
          const migratedUrl = await uploadIfBase64(img);
          if (migratedUrl && migratedUrl !== img) migratedImages++;
          if (migratedUrl) cleaned.push(migratedUrl);
        }
        product.images = cleaned;
      }

      // Move any remaining base64 main image to Blob storage.
      if (typeof product.image === 'string' && product.image.startsWith('data:')) {
        product.image = await uploadIfBase64(product.image);
        migratedImages++;
      }

      // Backfill images array for older products that only ever had a
      // single "image" field, so the gallery/lightbox has something to show.
      if (!Array.isArray(product.images) || product.images.length === 0) {
        product.images = product.image ? [product.image] : [];
      }

      updated.push(product);
    }

    await kv.set('products', updated);

    return res.status(200).json({
      success: true,
      totalProducts: updated.length,
      migratedImages,
      droppedLegacyFields
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
