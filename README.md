# Portfolio, Huỳnh Nhật Khang

Next.js (App Router) + React Three Fiber + GSAP + Lenis. Bilingual (EN default, VI toggle).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Where things live

- `lib/content.ts`        all text, jobs, projects, stack (EN + VI). Edit here first.
- `components/Particles`  the 35,000-point WebGL cloud (shaders inline).
- `components/Hero`       the one load animation (GSAP).
- `app/work/[slug]`       case study pages, generated from `projects`.
- `app/globals.css`       design tokens (colors, type) at the top.

## Deploy (Vercel)

Push to GitHub and import the repo. Optional env var:
`NEXT_PUBLIC_SITE_URL=https://your-domain` (used for Open Graph URLs).
