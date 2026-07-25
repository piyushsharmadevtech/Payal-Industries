import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const reviews = (await kv.get('reviews')) || [];
      return res.status(200).json(reviews);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.reviewerName || !body.rating || !body.text) {
        return res.status(400).json({ error: 'reviewerName, rating and text are required' });
      }
      const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
      const reviews = (await kv.get('reviews')) || [];
      const newReview = {
        id: Date.now(),
        reviewerName: body.reviewerName,
        companyName: body.companyName || '',
        rating,
        text: body.text,
        text_hi: body.text_hi || '',
        productId: body.productId ? String(body.productId) : null,
        date: new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric' })
      };
      reviews.push(newReview);
      await kv.set('reviews', reviews);
      return res.status(201).json(newReview);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const body = req.body || {};
      const reviews = (await kv.get('reviews')) || [];
      const idx = reviews.findIndex(r => String(r.id) === String(id));
      if (idx === -1) return res.status(404).json({ error: 'Review not found' });
      const updated = {
        ...reviews[idx],
        ...body,
        rating: body.rating ? Math.min(5, Math.max(1, Number(body.rating))) : reviews[idx].rating,
        productId: body.productId !== undefined ? (body.productId ? String(body.productId) : null) : reviews[idx].productId,
        id: reviews[idx].id
      };
      reviews[idx] = updated;
      await kv.set('reviews', reviews);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      let reviews = (await kv.get('reviews')) || [];
      reviews = reviews.filter(r => String(r.id) !== String(id));
      await kv.set('reviews', reviews);
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
