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
      const queries = (await kv.get('queries')) || [];
      return res.status(200).json(queries);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.name || !body.phone || !body.message) {
        return res.status(400).json({ error: 'name, phone and message are required' });
      }
      const queries = (await kv.get('queries')) || [];
      const newQuery = {
        id: Date.now(),
        name: body.name,
        phone: body.phone,
        product: body.product || '',
        message: body.message,
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };
      queries.push(newQuery);
      await kv.set('queries', queries);
      return res.status(201).json(newQuery);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      let queries = (await kv.get('queries')) || [];
      queries = queries.filter(q => String(q.id) !== String(id));
      await kv.set('queries', queries);
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
