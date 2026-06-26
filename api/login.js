export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { username, password } = req.body || {};
  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'payal123';

  if (username === validUser && password === validPass) {
    return res.status(200).json({ success: true });
  }
  return res.status(401).json({ success: false });
}
