import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const orders = (await kv.get('pastOrders')) || [];
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.buyerName || !body.productId) {
        return res.status(400).json({ error: 'buyerName and productId are required' });
      }
      const orders = (await kv.get('pastOrders')) || [];
      const newOrder = {
        id: Date.now(),
        productId: String(body.productId),
        buyerName: body.buyerName,
        quantity: body.quantity || '',
        note: body.note || '',
        date: body.date || ''
      };
      orders.push(newOrder);
      await kv.set('pastOrders', orders);
      return res.status(201).json(newOrder);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      let orders = (await kv.get('pastOrders')) || [];
      orders = orders.filter(o => String(o.id) !== String(id));
      await kv.set('pastOrders', orders);
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
