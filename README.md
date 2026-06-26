# Payal Industries — Website + Backend (Vercel Ready)

This project is no longer a static-only site. It now includes a lightweight **serverless backend** that stores your data (products and inquiries) in a real database, so that:

- Every visitor sees the same live catalog — not just data stored in one browser
- Adding, editing, or deleting a product in the admin panel updates the data everywhere instantly
- The whole site can be deployed and hosted directly on Vercel

## File Structure

```
payal-industries/
├── index.html          → main website
├── admin.html          → admin panel
├── package.json        → dependency (@vercel/kv)
└── api/
    ├── products.js     → GET / POST / PUT / DELETE products
    ├── queries.js       → GET / POST / DELETE inquiries
    └── login.js        → admin login check
```

## Step 1 — Push to GitHub

```bash
cd payal-industries
git init
git add .
git commit -m "Payal Industries website + backend"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 2 — Import into Vercel

1. Sign in at [vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New Project** → select your GitHub repository → **Import**.
3. Framework preset: **Other** (no build step is required — the project is served as static files with serverless functions under `/api`).
4. Click **Deploy**. The first deployment will succeed even without a database connected, but products and inquiries won't be saved until Step 3 is complete.

## Step 3 — Connect a Database (Vercel KV)

1. Open your Vercel project dashboard and go to the **Storage** tab.
2. Click **Create Database** → select **KV** (Redis-based, free tier available).
3. Once created, click **Connect** to link it to your project.
4. Vercel will automatically set the `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables.
5. Redeploy the project (**Deployments** tab → **...** → **Redeploy**).

Once this is done, `/api/products` and `/api/queries` will read from and write to this database.

## Step 4 — Set an Admin Password (Recommended)

By default, the login credentials are `admin` / `payal123` (used only if no environment variables are set).

To set your own credentials for production:

1. Go to **Project → Settings → Environment Variables**.
2. Add:
   - `ADMIN_USERNAME` = your preferred username
   - `ADMIN_PASSWORD` = a strong password
3. Redeploy the project.

## Local Development (Optional)

```bash
npm install -g vercel
npm install
vercel dev
```

This runs the site at `http://localhost:3000`, including the `/api/*` routes.

## Important Notes

- **Images:** The admin panel accepts either an image URL or a file upload from your gallery. Uploaded files are stored as base64 strings in the database — small to medium images (up to ~1–2MB) work fine. For larger images, it's better to use an image-hosting service (e.g. Cloudinary, ImageKit) and paste the resulting URL, to keep the database lightweight.
- **Security:** Admin login is now verified server-side (`/api/login`), but this remains a simple single-password system. For handling sensitive data at scale, consider a production-grade authentication provider such as NextAuth or Clerk.
- **Data:** `products` and `queries` are stored in Vercel KV as JSON arrays under a single key each — this is well suited for small to medium catalogs (a few hundred products or inquiries).
