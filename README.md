# Payal Industries — Website + Backend (Vercel ready)

Yeh project ab static HTML nahi hai — isme ek chhota **serverless backend** add ho gaya hai jo aapka data (products aur inquiries) ek real database me save karta hai, taaki:
- Sab visitors ko same live catalog dikhe (sirf aapke browser tak limited nahi)
- Admin panel se add/edit/delete karte hi data sab jagah update ho
- Vercel par directly host kar sakein

## File structure

```
payal-industries/
├── index.html          → main website
├── admin.html          → admin panel
├── package.json        → dependency (@vercel/kv)
└── api/
    ├── products.js     → GET/POST/PUT/DELETE products
    ├── queries.js      → GET/POST/DELETE inquiries
    └── login.js        → admin login check
```

## Step 1 — GitHub par push karein

```bash
cd payal-industries
git init
git add .
git commit -m "Payal Industries website + backend"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 2 — Vercel par import karein

1. [vercel.com](https://vercel.com) par login karein (GitHub se)
2. **Add New Project** → apna GitHub repo select karein → **Import**
3. Framework preset: **Other** (kuch build step nahi chahiye, root me hi static files + `/api` hain)
4. **Deploy** dabayein — pehli deploy bina database ke bhi chal jayegi, lekin products/queries save nahi honge jab tak Step 3 na karein.

## Step 3 — Database connect karein (Vercel KV)

1. Apne Vercel project ke dashboard me **Storage** tab kholen
2. **Create Database** → **KV** (Redis-based, free tier available) select karein
3. Database create hone ke baad, isko apne project se **Connect** karein
4. Vercel automatically `KV_REST_API_URL` aur `KV_REST_API_TOKEN` environment variables set kar dega
5. Project ko **Redeploy** karein (Deployments tab → ... → Redeploy)

Bas — ab `/api/products` aur `/api/queries` is database me data save/read karenge.

## Step 4 — Admin password set karein (recommended)

Abhi default login hai: `admin` / `payal123` (agar env variables set nahi hain).
Production me apna khud ka password set karne ke liye:

1. Project → **Settings** → **Environment Variables**
2. Add karein:
   - `ADMIN_USERNAME` = aapka username
   - `ADMIN_PASSWORD` = aapka strong password
3. Redeploy karein

## Local par test karna (optional)

```bash
npm install -g vercel
npm install
vercel dev
```

Yeh `http://localhost:3000` par site chalayega, `/api/*` routes ke saath.

## Important notes

- **Images:** Admin panel me image ya to URL se ya gallery se upload hoti hai. Gallery upload base64 string ke roop me database me save hota hai — chhoti/medium images (~1-2MB tak) theek chalengi. Bahut badi images ke liye, better hai ki kisi image-hosting service (Cloudinary, ImageKit, ya simple URL) ka link paste karein, taaki database halka rahe.
- **Security:** Admin login ab server-side check hota hai (`/api/login`), lekin yeh ek simple single-password system hai — bahut sensitive data ke liye production-grade auth (jaise NextAuth ya Clerk) consider karein.
- **Data:** `products` aur `queries` Vercel KV me ek-ek key ke under JSON array ki tarah store hote hain — yeh chhote-medium catalogs (kuch sau products/inquiries) ke liye perfectly theek hai.
