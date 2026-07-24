import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb'
    }
  }
};

function parseDataUrl(dataUrl) {
  const match = /^data:(.+);base64,(.*)$/.exec(dataUrl || '');
  if (!match) return null;
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const ext = mimeType.split('/')[1] || 'jpg';
  return { buffer, mimeType, ext };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { image } = req.body || {};
    if (!image) {
      return res.status(400).json({ error: 'image (base64 data URL) is required' });
    }

    // If it's already a normal URL (not base64), nothing to upload — just pass it back.
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return res.status(200).json({ url: image });
    }

    const parsed = parseDataUrl(image);
    if (!parsed) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${parsed.ext}`;

    const blob = await put(filename, parsed.buffer, {
      access: 'public',
      contentType: parsed.mimeType
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
