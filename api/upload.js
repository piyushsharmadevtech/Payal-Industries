import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb' // Multiple photos ke liye size limit thodi badha di hai
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
    const { image, images } = req.body || {};
    
    // Support both single 'image' or multiple 'images' array
    let filesToUpload = [];
    if (images && Array.isArray(images)) {
      filesToUpload = images;
    } else if (image) {
      filesToUpload = [image];
    }

    if (filesToUpload.length === 0) {
      return res.status(400).json({ error: 'image or images array is required' });
    }

    const uploadedUrls = [];

    for (const img of filesToUpload) {
      // If it's already a normal URL, keep it as is
      if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
        uploadedUrls.push(img);
        continue;
      }

      const parsed = parseDataUrl(img);
      if (!parsed) continue;

      const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${parsed.ext}`;

      const blob = await put(filename, parsed.buffer, {
        access: 'public',
        contentType: parsed.mimeType
      });

      uploadedUrls.push(blob.url);
    }

    // Agar single image bheji thi toh compatibility ke liye 'url' bhi bhej denge, aur 'urls' bhi
    return res.status(200).json({ 
      url: uploadedUrls[0] || '', 
      urls: uploadedUrls 
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
