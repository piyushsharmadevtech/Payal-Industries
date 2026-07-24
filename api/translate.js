// Lightweight server-side proxy for auto-translating catalog text (English -> Hindi).
// Uses the free MyMemory Translation API (no key required) so the browser never
// has to deal with CORS, and so we have one place to swap providers later.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { texts, target } = req.body || {};
    const targetLang = target === 'hi' ? 'hi' : 'en';
    const sourceLang = targetLang === 'hi' ? 'en' : 'hi';

    if (!Array.isArray(texts) || !texts.length) {
      return res.status(400).json({ error: 'texts (array of strings) is required' });
    }

    const results = await Promise.all(
      texts.map(async (raw) => {
        const text = (raw || '').toString().trim();
        if (!text) return '';
        try {
          const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
          const r = await fetch(url);
          if (!r.ok) return '';
          const data = await r.json();
          return data?.responseData?.translatedText || '';
        } catch {
          return '';
        }
      })
    );

    return res.status(200).json({ translations: results });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
