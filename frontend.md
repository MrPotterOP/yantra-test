# Frontend Architecture Guide
## CMS → Public Page Connection Pattern

**Project:** Yantra Skylights & Windows  
**Stack:** Next.js 14 App Router · MongoDB + Prisma · Cloudinary · ISR  
**Last updated:** 2026-08-22

---

## Core Philosophy

> The CMS is the **source of truth**. The frontend consumes it through a clean, layered pipeline: DB → Adapter → Server Component → HTML.

```
MongoDB (Prisma)
    │
    ▼
Public API Route        ← reads + resolves media, no auth
(/api/[type]/[slug])
    │
    ▼
Adapter Function        ← pure fn, converts DB shape → UI shape
(lib/adapters/)
    │
    ▼
ISR Server Component    ← pre-rendered at build, on-demand invalidation
(app/[type]/[slug]/page.js)
    │
    ▼
Existing UI Component   ← unchanged frontend components receive clean props
(components/[Type]Page/)
```

---

## 1. ISR — The Rendering Strategy

All public content pages use **Incremental Static Regeneration** with **on-demand-only** revalidation:

```js
// app/products/[slug]/page.js
export const revalidate = false; // NO periodic timer — on-demand only

export async function generateStaticParams() {
    // Pre-builds all published slugs at deploy time — zero cold start
    return publishedItems.map(item => ({ slug: item.slug }));
}
```

### On-demand invalidation (the ONLY revalidation mechanism)

The API routes for the **CMS** (admin) already call `revalidateContent(type, slug)` after every save/update/delete. This immediately busts the ISR cache — changes are live in under 1 second.

> **Why `revalidate = false` instead of `revalidate = 3600`?**
> For this project the CMS is the authoritative mutation channel. Periodic re-renders would just waste build quota and add unnecessary server load. On-demand revalidation gives us zero stale data *and* zero wasted re-renders.

---

## 2. Data Fetching Pattern

**Two queries max — no N+1:**

```js
// 1. Fetch the content document
const product = await prisma.product.findFirst({ where: { slug, isPublished: true } });

// 2. Batch-resolve ALL image IDs in a single query
const mediaItems = await prisma.media.findMany({
    where: { id: { in: product.imageIds } }
});
```

Never loop and query inside a `.map()` — always batch-collect IDs first, then do one `findMany`.

---

## 3. Adapter Layer

Each content type has an adapter in `lib/adapters/`:

| File | Exports | Purpose |
|------|---------|---------|
| `lib/adapters/product-adapter.js` | `productToDetailProps`, `productToCardProps` | Product DB → UI |
| `lib/adapters/project-adapter.js` | *(to be created)* | Project DB → UI |
| `lib/adapters/blog-adapter.js` | *(to be created)* | Blog DB → UI |

### Adapter rules
- **Pure functions** — no side effects, no DB calls, no imports from Next.js
- Takes `(document, mediaMap)` where `mediaMap = { [id]: { url, alt } }`
- Returns the exact shape the existing UI component expects
- Apply Cloudinary transforms **inside** the adapter when building `mediaMap`

---

## 4. Cloudinary URL Transforms

All image transforms live in `lib/cloudinary-url.js`. Use the right function for the right context:

| Function | Dimensions | Usage |
|----------|-----------|-------|
| `productGalleryUrl(url)` | 1400×1050 fill, 2×DPR | Main product image viewer |
| `productThumbUrl(url)` | 120×90 fill | Thumbnail strip below viewer |
| `cardUrl(url)` | 640×480 fill, 2×DPR | Carousel card images |
| `thumbnailUrl(url)` | 220×165 fill, 2×DPR | CMS media grid tiles |
| `squareThumbUrl(url)` | N×N fill | CMS media picker small tiles |
| `ogUrl(url)` | 1200×630 fill | Open Graph / social share |
| `autoUrl(url)` | (no resize) | Full-res download |

**Never use `next/image` optimization for Cloudinary images** — Cloudinary transforms are applied server-side and cached at the CDN level. This ensures images stay fast even if `images: { unoptimized: true }` is set in `next.config.js`.

---

## 5. Public API Routes

Public routes live at `/api/[type]/` — separate from the admin routes at `/api/admin/[type]/`.

| Route | Auth | Returns |
|-------|------|---------|
| `GET /api/products` | ❌ None | Card shape for carousels |
| `GET /api/products/[slug]` | ❌ None | Full detail shape with resolved media |
| `GET /api/products/[slug]?preview=true` | ❌ None | Same but bypasses `isPublished` check |

**ISR pages should NOT call public API routes** — they query Prisma directly for zero latency (no HTTP overhead, runs server-side in the same process). Public API routes exist for client-side consumers only (e.g., carousels rendered client-side, external apps).

---

## 6. SEO Metadata Pattern

Every ISR page implements `generateMetadata`:

```js
export async function generateMetadata({ params }) {
    const item = await fetchItem(params.slug);
    if (!item) return { title: 'Not Found | Yantra' };

    return {
        title: `${item.metaTitle || item.title} | Yantra`,
        description: item.metaDescription || item.description,
        openGraph: {
            title: item.metaTitle || item.title,
            description: item.metaDescription || item.description,
            type: 'website',
            url: `/[type]/${item.slug}`,
            images: [{ url: ogUrl(item.coverImgUrl), width: 1200, height: 630 }],
        },
        twitter: { card: 'summary_large_image' },
        alternates: { canonical: `/[type]/${item.slug}` },
    };
}
```

CMS provides `metaTitle` + `metaDescription` — always fall back to `title` + `description` if blank.

---

## 7. CMS Preview Button

Every CMS form (Product, Project, Blog) should have a **Preview** button in the sticky sidebar:

```
[ Save Changes ]
[ Preview ↗    ]  ← disabled until required fields are filled
```

**How it works:**
1. Form encodes its current state + resolved image URLs as `btoa(JSON.stringify(payload))`
2. Opens `/[type]/preview?data=<base64>` in a new tab (`noopener,noreferrer`)
3. Preview page decodes, runs through the adapter, renders the real UI component
4. Preview page is a **client component** — never cached, never indexed

**Encoding:** Use `btoa(unescape(encodeURIComponent(JSON.stringify(payload))))` to handle unicode safely.

**Decoding:** Use `JSON.parse(decodeURIComponent(escape(atob(data))))`.

---

## 8. Page Structure — Products

```
src/app/
├── product/page.js              ← redirects to /products (legacy)
├── products/
│   ├── page.js                  ← (future) products listing / filter page
│   ├── [slug]/
│   │   ├── page.js              ← ISR product detail (Server Component)
│   │   └── opengraph-image.js   ← (future) dynamic OG image
│   └── preview/
│       └── page.js              ← CMS draft preview (Client Component, no-store)
```

---

## 9. Connecting Future Pages

Follow this checklist for **Projects** and **Blog**:

- [x] Create `lib/adapters/[type]-adapter.js` with `[Type]ToDetailProps` + `[Type]ToCardProps`
- [x] Add URL transform helpers to `lib/cloudinary-url.js` if needed
- [x] Create `src/app/api/[type]/route.js` (listing, published only)
- [x] Create `src/app/api/[type]/[slug]/route.js` (single + `?preview=true`)
- [x] Create `src/app/[type]/[slug]/page.js` (ISR Server Component)
- [x] Create `src/app/[type]/preview/page.js` (Client Component, base64 decode)
- [x] Add Preview button to CMS `[Type]Form.js`
- [x] Update `generateStaticParams` to include all published slugs
- [x] Verify `revalidateContent(type, slug)` is called on all CMS mutations

**Status:** Products ✅ · Projects ✅ · Blogs ✅

---

## 10. Not-Found & Error Handling

```js
// ISR page — unpublished product returns 404
if (!product) notFound();   // renders /not-found.js — never leaks draft content

// API route — clean JSON error
return NextResponse.json({ error: 'Product not found' }, { status: 404 });
```

Always call `notFound()` (not a redirect) for missing/unpublished content — this gives search engines a clean 404 signal to de-index stale URLs.

---

## 11. Implemented Status

| Page | Status | Route |
|------|--------|-------|
| `/products/[slug]` | ✅ ISR + SEO | `app/products/[slug]/page.js` |
| `/products/preview` | ✅ Live | `app/products/preview/page.js` |
| `/api/products` | ✅ Live | `app/api/products/route.js` |
| `/api/products/[slug]` | ✅ Live | `app/api/products/[slug]/route.js` |
| CMS Preview (Product) | ✅ ProductForm | Sidebar, disabled until fields filled |
| `/projects/[slug]` | ✅ ISR + SEO | `app/projects/[slug]/page.js` |
| `/projects/preview` | ✅ Live | `app/projects/preview/page.js` |
| `/api/projects` | ✅ Live | `app/api/projects/route.js` |
| `/api/projects/[slug]` | ✅ Live | `app/api/projects/[slug]/route.js` |
| CMS Preview (Project) | ✅ ProjectForm | Sidebar, disabled until fields filled |
| `/blogs/[slug]` | ✅ ISR + SEO | `app/blogs/[slug]/page.js` |
| `/blogs/preview` | ✅ Live | `app/blogs/preview/page.js` |
| `/api/blogs` | ✅ Live | `app/api/blogs/route.js` |
| `/api/blogs/[slug]` | ✅ Live | `app/api/blogs/[slug]/route.js` |
| CMS Preview (Blog) | ✅ BlogForm | Sidebar, disabled until fields filled |
