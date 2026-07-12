# Deployment — Arrow Maze Admin SPA (AD-11, MAZ-212)

The admin is a static Vite SPA. Building produces a `dist/` folder of static assets served by
any static host (Netlify, Vercel, S3 + CloudFront, …). This repo ships the host configuration;
the actual deploy (connecting the repo/uploading `dist/`, DNS) is a human action.

## 1. Build

```bash
npm ci
VITE_API_BASE_URL=https://arrow-maze-backend-production-6dd8.up.railway.app npm run build   # → dist/
```

`VITE_API_BASE_URL` is read by `src/framework/config/env.ts` and **inlined at build time** by
Vite, so it must be set in the build environment (not at runtime). On a host, set it as a build
env var rather than passing it inline. If the var is missing in a production build, the app falls
back to `https://arrow-maze-backend-production-6dd8.up.railway.app` so production never calls
`http://localhost:3000`.

## 2. Host configuration (committed)

- **Netlify** — `netlify.toml` (build command, `publish = "dist"`, Node 20) + `public/_redirects`
  (`/* → /index.html 200`). Connect the repo; set `VITE_API_BASE_URL` under
  *Site settings → Environment*.
- **Vercel** — `vercel.json` (`buildCommand`, `outputDirectory: dist`, SPA `rewrites`). Import
  the repo; set `VITE_API_BASE_URL` under *Project → Settings → Environment Variables* for
  Production and redeploy after changing it.
- **S3 + CloudFront** — upload `dist/` to the bucket; set the SPA fallback so unknown paths
  return `index.html` (S3 static-website *error document* = `index.html`, or a CloudFront
  custom error response mapping 403/404 → `/index.html` with 200).

### SPA routing (why the fallback matters)

The app uses client-side routing (`createBrowserRouter`), so deep links / hard refreshes on
routes like `/levels` or `/levels/new` must serve `index.html` (status 200). Every host config
above encodes that rewrite.

## 3. CORS (BE-04)

The backend allows a comma-separated `CORS_ORIGIN` list (BE-04, MAZ-198). Add the admin's
deployed origin to it in the **backend's** environment, e.g.:

```
CORS_ORIGIN=http://localhost:8081,http://localhost:5173,https://arrow-maze-admin.vercel.app
```

Without this the deployed admin's requests are rejected by the browser (no allow header).

## 4. Verify after deploy

- The site loads and, after login, calls the **production** API (check the Network tab base URL).
- A hard refresh on `/levels` serves the app (SPA fallback), not a 404.
- No CORS errors in the console (BE-04 origin added).

> The build + host config are versioned here; performing the deploy and DNS is a human step
> (per the academic-integrity boundary — agents don't deploy).
