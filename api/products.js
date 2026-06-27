import { Redis } from '@upstash/redis';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;
const kv = new Redis({ url, token });

export default async function handler(req, res) {
  try {
    if (!url || !token) {
      return res.status(500).json({ error: 'Database not connected. Add a Redis/Upstash store from Vercel Storage and redeploy.' });
    }

    if (req.method === 'GET') {
      const products = (await kv.get('products')) || [];
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const images = Array.isArray(body.images) && body.images.length
        ? body.images
        : (body.image ? [body.image] : []);
      if (!body.name || images.length === 0) {
        return res.status(400).json({ error: 'name and at least one image are required' });
      }
      const products = (await kv.get('products')) || [];
      const newProduct = {
        id: Date.now(),
        name: body.name || '',
        size: body.size || '',
        colors: body.colors || '',
        material: body.material || '',
        description: body.description || '',
        images
      };
      products.push(newProduct);
      await kv.set('products', products);
      return res.status(201).json(newProduct);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const body = req.body || {};
      if (Array.isArray(body.images) && body.images.length === 0) {
        return res.status(400).json({ error: 'at least one image is required' });
      }
      let products = (await kv.get('products')) || [];
      let found = false;
      products = products.map(p => {
        if (String(p.id) === String(id)) { found = true; return { ...p, ...body, id: p.id }; }
        return p;
      });
      if (!found) return res.status(404).json({ error: 'product not found' });
      await kv.set('products', products);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      let products = (await kv.get('products')) || [];
      products = products.filter(p => String(p.id) !== String(id));
      await kv.set('products', products);
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
