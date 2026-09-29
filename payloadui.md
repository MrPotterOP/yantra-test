**Last updated:** 2026-09-26  
**Status:** Phase 1 ✅ · Phase 2 ✅ · Phase 3 (Blogs) ✅ · Phase 4 (Products) ✅ · Phase 6 (theme) ✅ · Phase 7 (Homepage) ✅ · Phase 8 (Revalidation) ✅

---

## Overview

Payload CMS v3 ships with a polished default admin UI built in React. We layer on top via:

1. **`src/app/(payload)/custom.css`** — CSS custom property overrides for colours, typography
2. **`payload.config.ts` → `admin.components`** — Swap specific admin UI components
3. **Collection `admin` config** — Labels, grouping, list view columns, `useAsTitle`
4. **Custom components**:
   - `SlugField.tsx` — Auto-generate slug from Title field via clean URL normalisation
   - `RevalidateButton.tsx` — Action bar button that manually busts Next.js ISR cache for current doc

---

## Bug Fix — Image URL Crash (next/image) ✅ Fixed

**Root cause:** Payload's media upload relationship stores only the MongoDB ObjectId
in the DB. At insufficient query depth, the `resolveMediaUrl()` helper returned the
raw ID string (e.g. `"6aa505ea4f906b5d9e9dd666"`) which crashed `next/image`.

**Fix applied:**
- Added `isValidImageSrc()` helper in all three adapters (project, blog, product)
  that rejects 24-char hex ObjectIds and returns `''` instead
- Bumped all query `depth` values from 1 → 2 across homepage, listing, and detail pages
- Card components (`Project.js`, `Product.js`) already render a graceful fallback
  when `coverImg` is falsy — now they work correctly

**Files changed:**
- `src/lib/adapters/project-adapter.js` — `isValidImageSrc` + `resolveMediaUrl` rewrite
- `src/lib/adapters/blog-adapter.js` — same guard applied
- `src/lib/adapters/product-adapter.js` — same guard (new file)
- `src/app/(frontend)/page.js` — depth 1 → 2
- `src/app/(frontend)/project/page.js` — depth 1 → 2
- `src/app/(frontend)/project/[slug]/page.js` — depth 1 → 2

---

## Phase 1 — Media Library ✅ Complete

| File | Purpose |
|---|---|
| `src/collections/Media.ts` | Media collection config |
| `src/lib/cloudinary-adapter.ts` | Cloudinary storage adapter |
| `payload.config.ts` | Updated with Media + cloudStoragePlugin |

### Cloudinary integration
- Package: `@payloadcms/plugin-cloud-storage` + `cloudinary` (v2 SDK)
- All uploads go to Cloudinary folder `yantra/<docFolder>/`
- `disableLocalStorage: true` — no disk writes
- `disablePayloadAccessControl: true` — files served from Cloudinary CDN
- `generateFileURL` returns Cloudinary transformation URLs per image size

### Media collection admin experience
- **List view** shows thumbnail, alt text, folder, file size, MIME type
- **Upload** supports JPEG, PNG, WebP, AVIF, GIF, SVG
- **Image sizes**: `thumbnail` (400×300), `card` (768×512), `hero` (1920×1080)
- **Fields**: `altText` (required), `caption` (optional), `folder` (select)
- **Access**: public read, authenticated write/delete

---

## Phase 2 — Project Categories & Projects ✅ Complete

### What was built

| File | Purpose |
|---|---|
| `src/collections/Categories.ts` | Project Categories collection |
| `src/collections/Projects.ts` | Projects collection (all required fields + SlugField + PreviewButton + isFeatured + relatedBlogs) |
| `src/components/payload/SlugField.tsx` | Auto-generate slug button component |
| `src/components/payload/PreviewButton.tsx` | Edit-view preview action button |
| `src/lib/adapters/project-adapter.js` | DB → UI shape adapter |
| `src/app/(frontend)/project/[slug]/page.js` | ISR detail page |
| `src/app/(frontend)/project/page.js` | Listing page (category carousels) |

### Admin sidebar structure

```
▶ Collections
    Users
▶ Projects
    Project Categories
    Projects
▶ Content
    Media
    Blog Posts
▶ Products
    Products
```

### Projects admin experience
- **Group:** Projects
- **useAsTitle:** `title`
- **List columns:** Title, Category, Location, Project Number, Featured on Homepage, Updated At
- **Slug field:** Uses custom `SlugField` with auto-generate button from title.
- **Preview button:** Custom header action, disabled until title, slug, location, category, and heroImage are set.
- **Featured on Homepage:** Checkbox toggle in sidebar controls homepage featured showcase.
- **Related Blogs:** Many-to-many relationship linking blog posts featuring or referencing this project.
- **Category field:** Relationship dropdown to project-categories. Position: sidebar. Required.
- **Hero Image / Story Image:** Upload pickers to Media library.
- **Gallery:** Multi-select relationship to Media (hasMany: true).
- **Specifications:** Array with min 2 / max 5 rows, each has Label + Value text inputs.
- **ISR:** `afterChange` → `revalidatePath('/project')`, `revalidatePath('/project/${slug}')`, and `revalidatePath('/')` if featured.

---

## Phase 3 — Blogs & Lexical Rich Text ✅ Complete

### What was built

| File | Purpose |
|---|---|
| `src/collections/Blogs.ts` | Blogs collection config with Lexical rich text & media integration |
| `src/lib/adapters/blog-adapter.js` | Pure adapter converting Payload doc → BlogHero, BlogBody, Blog card, and Carousel props |
| `src/app/(frontend)/blog/[slug]/page.js` | ISR detail page (Server Component, on-demand revalidation) |
| `src/app/(frontend)/blog/page.js` | Blog listing and journal index page |
| `src/components/Blogs/Blog.js` | Updated link route to `/blog/${data.slug}` |
| `src/components/Blogs/Blogs.js` | Added `blogs` prop support with backward-compatible fallback |

### Blogs schema & admin experience
- **Group:** Content
- **useAsTitle:** `title`
- **List columns:** Title, Author, Date, Featured on Homepage, Updated At
- **Fields:**
  - `title` (text, required)
  - `slug` (text, required, unique, custom `SlugField` auto-generator)
  - `date` (date, required, auto-set on creation, updated on edit, editable in sidebar)
  - `author` (text, required, default "Yantra Editorial Team", sidebar)
  - `isFeatured` (checkbox, sidebar, controls homepage blog section)
  - `coverImage` (upload relationTo `media`, required)
  - `body` (richText Lexical editor with image upload tool from Media library)
  - `body_html` (virtual lexicalHTMLField for instant HTML parsing)
  - `relatedProjects` (relationship to `projects`, hasMany: true, sidebar)
  - `relatedBlogs` (relationship to `blogs`, hasMany: true, self-referential)
- **Preview button:** Integrated in action bar (`PreviewButton`), disabled with tooltip until required fields (title, slug, author, coverImage, body) are populated.
- **ISR:** `afterChange`/`afterDelete` bust cache on `/blog`, `/blog/${slug}`, and `/` (if featured).

---

## Phase 4 — Products ✅ Complete

### What was built

| File | Purpose |
|---|---|
| `src/collections/Products.ts` | Products collection with full schema |
| `src/lib/adapters/product-adapter.js` | DB → UI shape adapter (productToCardProps, productToDetailProps) |
| `src/app/(frontend)/products/page.js` | ISR listing page (category carousels) |
| `src/app/(frontend)/products/[slug]/page.js` | ISR detail page (ProductDetails.js + Carousel) |
| `src/components/ProductPage/ProductDetails/ProductDetails.js` | Added empty-images guard |

### Products schema & admin experience
- **Group:** Products
- **useAsTitle:** `title`
- **List columns:** Title, Category, Featured on Homepage, Updated At
- **Fields:**
  - `title` (text, required)
  - `slug` (text, required, unique, custom `SlugField` auto-generator)
  - `subtitle` (text, required) — subheading on product detail page
  - `category` (text, required) — used for breadcrumbs & grouping on listing page
  - `isFeatured` (checkbox, sidebar) — controls homepage products section
  - `images` (array, required, minRows: 1) — each row: `image` (upload) + `alt` text
  - `description` (textarea, required) — narrative paragraph
  - `specs` (array, required, min 1, max 12) — `{ label, value }` rows
  - `customizations` (array, optional) — configurator options: `{ title, type, choices }` where type ∈ color/image/text
  - `support` (array, optional) — accordion sections: `{ title, content }`
  - `relatedProjects` (relationship to `projects`, hasMany: true, sidebar)
  - `relatedBlogs` (relationship to `blogs`, hasMany: true, sidebar)
  - `relatedProducts` (relationship to `products`, hasMany: true, self-referential, sidebar)
- **Preview button:** Custom header action via `PreviewButton` component
- **ISR:** `afterChange` → `revalidatePath('/products')`, `revalidatePath('/products/${slug}')`, and `revalidatePath('/')` if featured

### Frontend rendering
- `/products` — listing page groups products by `category` field, renders `<Carousel type="product" />` per group
- `/products/[slug]` — detail page with `<ProductDetail product={...} />`, similar products carousel, related projects carousel
- `ProductDetails.js` enhanced with image-array guard (graceful fallback when no images uploaded yet)

---

## Phase 5 — Careers & Applications ✅ Complete

### What was built

| File | Purpose |
|---|---|
| `src/collections/Careers.ts` | Job listings collection |
| `src/collections/Applications.ts` | Application inbox (read-only applicant data, status-managed by admin) |
| `src/app/api/careers/route.js` | GET /api/careers — public active listings endpoint |
| `src/app/api/careers/[slug]/apply/route.js` | POST /api/careers/:slug/apply — full validation |
| `src/app/(frontend)/careers/page.js` | Async Server Component with ISR + Payload Local API |
| `src/components/Careers/OpenRoles/OpenRoles.js` | initialRoles SSR prop, enhanced error handling |

### Careers fields: role, slug, field, location, description, isActive
### Applications fields: fullName, email, phone, resumeLink, coverNote, career relationship, status (new/reviewed/shortlisted/rejected), notes

### API design
- GET /api/careers: returns active listings only, 60s CDN cache, graceful degradation
- POST /api/careers/:slug/apply: email/phone/URL validation, slug+isActive check, 422 with per-field errors, 404 on deactivated role

---

## Phase 6 — Admin UI Custom Theme ✅ Complete

**File:** `src/app/(payload)/custom.css`

### Implementation approach
- Neutral grey scale (`--color-base-*`) left intact for dark/light contrast integrity
- Primary actions and highlights set to amber-500 (`#f59e0b`) / amber-600 (`#d97706`)
- Micro-animations, responsive action bars, scaled dashboard typography

---

## Phase 7 — Home Page Frontend Integration ✅ Complete

**File:** `src/app/(frontend)/page.js`

- Converted to async Server Component
- Fetches featured projects (`isFeatured: true`) from Payload local API (depth: 2), passing to `<Projects projects={cmsProjects} />`
- Fetches featured blogs (`isFeatured: true`) from Payload local API (depth: 2), passing to `<Carousel type="blog" data={cmsBlogs} title="Read More About" />`
- Zero latency: runs in-process via Payload Local API
- Graceful fallbacks: If no records exist in CMS yet, falls back to original design mock data


---

## Overview

Payload CMS v3 ships with a polished default admin UI built in React. We layer on top via:

1. **`src/app/(payload)/custom.css`** — CSS custom property overrides for colours, typography
2. **`payload.config.ts` → `admin.components`** — Swap specific admin UI components
3. **Collection `admin` config** — Labels, grouping, list view columns, `useAsTitle`
4. **Custom components**:
   - `SlugField.tsx` — Auto-generate slug from Title field via clean URL normalisation
   - `PreviewButton.tsx` — Header action button opening live preview, disabled until required fields are filled

---

## Phase 1 — Media Library ✅ Complete

| File | Purpose |
|---|---|
| `src/collections/Media.ts` | Media collection config |
| `src/lib/cloudinary-adapter.ts` | Cloudinary storage adapter |
| `payload.config.ts` | Updated with Media + cloudStoragePlugin |

### Cloudinary integration
- Package: `@payloadcms/plugin-cloud-storage` + `cloudinary` (v2 SDK)
- All uploads go to Cloudinary folder `yantra/<docFolder>/`
- `disableLocalStorage: true` — no disk writes
- `disablePayloadAccessControl: true` — files served from Cloudinary CDN
- `generateFileURL` returns Cloudinary transformation URLs per image size

### Media collection admin experience
- **List view** shows thumbnail, alt text, folder, file size, MIME type
- **Upload** supports JPEG, PNG, WebP, AVIF, GIF, SVG
- **Image sizes**: `thumbnail` (400×300), `card` (768×512), `hero` (1920×1080)
- **Fields**: `altText` (required), `caption` (optional), `folder` (select)
- **Access**: public read, authenticated write/delete

---

## Phase 2 — Project Categories & Projects ✅ Complete (Updated)

### What was built

| File | Purpose |
|---|---|
| `src/collections/Categories.ts` | Project Categories collection |
| `src/collections/Projects.ts` | Projects collection (all required fields + SlugField + PreviewButton + isFeatured + relatedBlogs) |
| `src/components/payload/SlugField.tsx` | Auto-generate slug button component |
| `src/components/payload/PreviewButton.tsx` | Edit-view preview action button |
| `src/lib/adapters/project-adapter.js` | DB → UI shape adapter |
| `src/app/(frontend)/project/[slug]/page.js` | ISR detail page |
| `src/app/(frontend)/project/page.js` | Listing page (category carousels) |

### Admin sidebar structure

```
▶ Collections
    Users
▶ Projects
    Project Categories
    Projects
▶ Content
    Media
    Blog Posts
```

### Projects admin experience
- **Group:** Projects
- **useAsTitle:** `title`
- **List columns:** Title, Category, Location, Project Number, Featured on Homepage, Updated At
- **Slug field:** Uses custom `SlugField` with auto-generate button from title.
- **Preview button:** Custom header action, disabled until title, slug, location, category, and heroImage are set.
- **Featured on Homepage:** Checkbox toggle in sidebar controls homepage featured showcase.
- **Related Blogs:** Many-to-many relationship linking blog posts featuring or referencing this project.
- **Category field:** Relationship dropdown to project-categories. Position: sidebar. Required.
- **Hero Image / Story Image:** Upload pickers to Media library.
- **Gallery:** Multi-select relationship to Media (hasMany: true).
- **Specifications:** Array with min 2 / max 5 rows, each has Label + Value text inputs.
- **ISR:** `afterChange` → `revalidatePath('/project')`, `revalidatePath('/project/${slug}')`, and `revalidatePath('/')` if featured.

---

## Phase 3 — Blogs & Lexical Rich Text ✅ Complete

### What was built

| File | Purpose |
|---|---|
| `src/collections/Blogs.ts` | Blogs collection config with Lexical rich text & media integration |
| `src/lib/adapters/blog-adapter.js` | Pure adapter converting Payload doc → BlogHero, BlogBody, Blog card, and Carousel props |
| `src/app/(frontend)/blog/[slug]/page.js` | ISR detail page (Server Component, on-demand revalidation) |
| `src/app/(frontend)/blog/page.js` | Blog listing and journal index page |
| `src/components/Blogs/Blog.js` | Updated link route to `/blog/${data.slug}` |
| `src/components/Blogs/Blogs.js` | Added `blogs` prop support with backward-compatible fallback |

### Blogs schema & admin experience
- **Group:** Content
- **useAsTitle:** `title`
- **List columns:** Title, Author, Date, Featured on Homepage, Updated At
- **Fields:**
  - `title` (text, required)
  - `slug` (text, required, unique, custom `SlugField` auto-generator)
  - `date` (date, required, auto-set on creation, updated on edit, editable in sidebar)
  - `author` (text, required, default "Yantra Editorial Team", sidebar)
  - `isFeatured` (checkbox, sidebar, controls homepage blog section)
  - `coverImage` (upload relationTo `media`, required)
  - `body` (richText Lexical editor with image upload tool from Media library)
  - `body_html` (virtual lexicalHTMLField for instant HTML parsing)
  - `relatedProjects` (relationship to `projects`, hasMany: true, sidebar)
  - `relatedBlogs` (relationship to `blogs`, hasMany: true, self-referential)
- **Preview button:** Integrated in action bar (`PreviewButton`), disabled with tooltip until required fields (title, slug, author, coverImage, body) are populated.
- **ISR:** `afterChange`/`afterDelete` bust cache on `/blog`, `/blog/${slug}`, and `/` (if featured).

---

## Phase 4 — Products (TODO)

### Collections to create
- `src/collections/Products.ts`

### Products admin features planned
- Auto-generate slug from title (via `SlugField`)
- Gallery image picker using relationship → media (hasMany: true)
- Technical specs dynamic array `[{ property, value }]` (≥1)
- Published/Featured toggles in sidebar
- Preview button integration
- List view columns: Title, Category, Published, Featured, Updated

---

## Phase 5 — Careers & Applications (TODO)

### Collections to create
- `src/collections/Careers.ts`
- `src/collections/Applications.ts`

### Careers admin features planned
- `isActive` toggle
- Application count via `afterRead` hook

### Applications admin features planned
- Status badges: New / Reviewed / Shortlisted / Rejected
- Filter by status in list view
- Read-only (applications come from the public form)

---

## Phase 6 — Admin UI Custom Theme ✅ Complete

**File:** `src/app/(payload)/custom.css`

### Implementation approach
- Neutral grey scale (`--color-base-*`) left intact for dark/light contrast integrity
- Primary actions and highlights set to amber-500 (`#f59e0b`) / amber-600 (`#d97706`)
- Micro-animations, responsive action bars, scaled dashboard typography

---

## Phase 7 — Home Page Frontend Integration ✅ Complete

**File:** `src/app/(frontend)/page.js`

- Converted to async Server Component
- Fetches featured projects (`isFeatured: true`) from Payload local API, passing to `<Projects projects={cmsProjects} />`
- Fetches featured blogs (`isFeatured: true`) from Payload local API, passing to `<Carousel type="blog" data={cmsBlogs} title="Read More About" />`
- Zero latency: runs in-process via Payload Local API
- Graceful fallbacks: If no records exist in CMS yet, falls back to original design mock data

---

## Phase 8 — On-Demand CMS Revalidation ✅ Complete

### Purpose

Allows editors to manually force a Next.js ISR cache refresh for any Blog, Project, or Product directly from the CMS edit view — without needing to save/re-publish the document or wait for an automated hook.

### Files

| File | Role |
|---|---|
| `src/app/api/revalidate/route.ts` | Secure POST endpoint that calls `revalidatePath()` |
| `src/components/payload/RevalidateButton.tsx` | Custom Payload admin action button |

### Architecture

```
Editor clicks "↻ Revalidate" in CMS action bar
    ↓
RevalidateButton.tsx calls POST /api/revalidate
    with { collection, slug } + Authorization: Bearer <payload-token>
    ↓
API route validates token via payload.auth({ headers })
    → Invalid/expired token → 401 Unauthorized
    → Unknown collection → 400 Bad Request
    ↓
revalidatePath() called for:
    blogs    → ["/blog", "/blog/slug", "/"]
    projects → ["/project", "/project/slug", "/"]
    products → ["/products", "/products/slug", "/"]
    ↓
Next.js marks those routes stale — next request serves fresh RSC + HTML
    ↓
Button shows green "✓ Revalidated" for 3 seconds → returns to idle
```

### Security Model

- **Auth**: Uses the editor's existing Payload JWT from `useAuth().token`. No extra secrets in the client bundle.
- **Server validation**: `payload.auth({ headers })` verifies the token server-side. Invalid/expired → 401.
- **Collection allowlist**: Only `blogs`, `projects`, `products` accepted. No arbitrary path injection.
- **Slug validation**: Slug validated against `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` before use.
- **Logging**: Every revalidation logged with admin email, collection, slug, timestamp.

### UX State Machine

| State | Appearance | Condition |
|---|---|---|
| `idle` (no slug) | Amber dimmed, disabled | Document has no slug yet |
| `idle` (has slug) | Amber outline, clickable | Ready to revalidate |
| `loading` | Spinning icon, disabled | Request in flight |
| `success` | Green "✓ Revalidated" | API returned 200 — resets after 3s |
| `error` | Red "Retry" | API/network error — resets after 4s |

### Registered On

`Projects`, `Products`, `Blogs` — `admin.components.views.edit.default.actions`. Returns `null` for all other collections.
