# Yantra — Payload CMS Master Plan

**Project:** Yantra Skylights & Windows  
**CMS:** Payload CMS v3.88 (TypeScript config + JS everywhere else)  
**DB:** MongoDB via `@payloadcms/db-mongodb` (mongoose adapter)  
**Media:** Cloudinary via `@payloadcms/plugin-cloud-storage` + `cloudinary` SDK  
**Framework:** Next.js 16 (App Router)  
**Last updated:** 2026-09-12

---

## Overview

Migrating from a custom-built CMS (Next.js API routes + Prisma/MongoDB) to **Payload CMS v3** which runs directly inside Next.js as a plugin. Payload handles authentication, the admin UI, REST + GraphQL APIs, and all CRUD operations. Our job is to define collections and configure the admin panel.

The frontend pages progressively consume data from Payload's local API instead of hardcoded mock data.

---

## Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| CMS Framework | Payload CMS v3.88 | In-process with Next.js |
| Database | MongoDB Atlas | `DATABASE_URL` in `.env` |
| File Storage | Cloudinary | `@payloadcms/plugin-cloud-storage` + `cloudinary` SDK |
| Rich Text | Lexical Editor | Built into Payload with Media upload tool |
| Auth | Payload built-in Users | |
| Config language | TypeScript (`payload.config.ts`) | allowJs=true for all other files |
| Frontend language | JavaScript (`.js` / `.jsx`) | Existing pattern maintained |

---

## Phase Roadmap

| Phase | Scope | Status |
|---|---|---|
| **Phase 1** | DB setup + Media collection + Cloudinary integration | ✅ DONE |
| **Phase 2** | Project Categories + Projects collection + Frontend ISR | ✅ DONE |
| **Phase 3** | Blogs collection + Lexical rich text + Frontend ISR | ✅ DONE |
| Phase 4 | Products collection | ✅ DONE |
| Phase 5 | Careers + Applications collections | ✅ DONE |
| **Phase 6** | Admin UI custom theme (amber/sunbeam palette) | ✅ DONE (custom.css) |
| **Phase 7** | Home page frontend integration | ✅ DONE |
| **Phase 8** | CMS Preview System (Draft Mode + PreviewBanner) | ✅ DONE |

---

## Collection Schemas (Full Reference)

### 1. Media (Phase 1) ✅

**Slug:** `media`  
**Storage:** Cloudinary (via `@payloadcms/plugin-cloud-storage`)

| Field | Type | Notes |
|---|---|---|
| `altText` | text | Required |
| `caption` | text | Optional |
| `folder` | select | `general` / `products` / `projects` / `blogs` |
| `url` | auto | Stored by cloudinary-adapter on upload |
| `thumbnailURL` | auto | `w_400,h_300,c_fill` — admin preview |
| `width` / `height` | number | From Cloudinary upload result |

---

### 2. Project Categories (Phase 2) ✅

**Slug:** `project-categories`  
**Admin Group:** Projects

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | text | ✅ | Tag pill on cards (max 80 chars) |
| `slug` | text | auto | Auto-generated from name |
| `description` | textarea | ❌ | Optional |

**Hooks:** `beforeValidate` → auto-slug | `afterChange`/`afterDelete` → `revalidatePath('/project')`

---

### 3. Projects (Phase 2) ✅

**Slug:** `projects`  
**Admin Group:** Projects | **All fields required**

| Field | Type | Notes |
|---|---|---|
| `title` | text | Max 150 chars. On hero + card |
| `slug` | text | Auto-gen button via `SlugField` component |
| `projectNumber` | text | e.g. "1003" — shown in hero |
| `location` | text | City/region. On hero + card |
| `category` | relationship → `project-categories` | hasMany: false |
| `isFeatured` | checkbox | Featured on Homepage toggle |
| `heroImage` | upload → `media` | Full-bleed hero background |
| `specifications` | array [{label, value}] | Min 2, max 5 |
| `storyTitle` | text | Story section heading |
| `storyDescription` | textarea | Narrative text |
| `storyImage` | upload → `media` | Sticky image in story |
| `gallery` | relationship → `media` (hasMany: true) | Gallery images |
| `relatedBlogs` | relationship → `blogs` (hasMany: true) | Articles featuring this project |

**Admin UI:** Edit-view action bar includes custom amber `PreviewButton` (`/project/[slug]?preview=true`).

**Hooks:** `beforeValidate` → auto-slug | `afterChange`/`afterDelete` → revalidate `/project`, `/project/[slug]`, and `/` (if featured).

---

### 4. Blogs (Phase 3) ✅

**Slug:** `blogs`  
**Admin Group:** Content | **All required fields enforced**

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | text | ✅ | Hero title & card title |
| `slug` | text | ✅ | Auto-generated via `SlugField` component |
| `date` | date | ✅ | Auto-set on creation, updated on edit, editable in sidebar |
| `author` | text | ✅ | Default "Yantra Editorial Team" |
| `isFeatured` | checkbox | ❌ | Featured on Homepage toggle |
| `coverImage` | upload → `media` | ✅ | Wide hero landscape (1200×628px) |
| `body` | richText (Lexical) | ✅ | Rich text with inline media upload picker |
| `body_html` | lexicalHTMLField | auto | Pre-converted virtual HTML field |
| `relatedProjects` | relationship → `projects` | ❌ | Many-to-many relationship (carousel) |
| `relatedBlogs` | relationship → `blogs` | ❌ | Self-referential relationship (carousel) |

**Admin UI:** Edit-view action bar includes custom amber `PreviewButton` (`/blog/[slug]?preview=true`), disabled until required fields are filled.

**Hooks:** `beforeValidate` → auto-set date, auto-slugify | `afterChange`/`afterDelete` → revalidate `/blog`, `/blog/[slug]`, and `/` (if featured).

---

### 5. Products (Phase 4) ✅

**Slug:** `products`
**Admin Group:** Products

| Field | Type | Notes |
|---|---|---|
| `title` | text | Required |
| `slug` | text | Required, unique, `SlugField` |
| `subtitle` | text | Required |
| `description` | textarea | Required |
| `category` | text | Required |
| `isFeatured` | checkbox | |
| `images` | array of upload | Gallery (≥1) with `alt` text |
| `specs` | array [{label, value}] | Required (1-12) |
| `customizations` | array | {title, type, choices} |
| `support` | array | {title, content} |
| `relatedProjects` | relationship → projects | |
| `relatedBlogs` | relationship → blogs | |
| `relatedProducts` | relationship → products | |

---

### 6. Careers (Phase 5) ✅

**Slug:** `careers`
**Admin Group:** Careers

| Field | Type | Notes |
|---|---|---|
| `role` | text | Required |
| `slug` | text | Required, unique, `SlugField` |
| `field` | text | Department, Required |
| `location` | text | Required |
| `description` | textarea | Required |
| `isActive` | checkbox | Default true |

---

### 7. Applications (Phase 5) ✅

**Slug:** `applications`
**Admin Group:** Careers

| Field | Type | Notes |
|---|---|---|
| `fullName` | text | Read-only |
| `email` | email | Read-only |
| `phone` | text | Read-only |
| `resumeLink` | text | Read-only |
| `coverNote` | textarea | Read-only |
| `career` | relationship → careers | Required, read-only |
| `status` | select | `new` / `reviewed` / `shortlisted` / `rejected` |
| `notes` | textarea | Admin only |

---

## Key Files

| File | Purpose | Status |
|---|---|---|
| `payload.config.ts` | Master config — collections, plugins, DB adapter | ✅ |
| `src/collections/Media.ts` | Media collection | ✅ |
| `src/collections/Categories.ts` | Project Categories collection | ✅ |
| `src/collections/Projects.ts` | Projects collection (with SlugField & PreviewButton) | ✅ |
| `src/collections/Blogs.ts` | Blogs collection (Lexical + Media upload) | ✅ |
| `src/components/payload/SlugField.tsx` | Custom Slug field with auto-generate button | ✅ |
| `src/components/payload/PreviewButton.tsx` | Custom Preview action button for CMS edit view | ✅ |
| `src/lib/cloudinary-adapter.ts` | Custom Cloudinary storage adapter | ✅ |
| `src/lib/adapters/project-adapter.js` | Project DB → UI prop adapter | ✅ |
| `src/lib/adapters/blog-adapter.js` | Blog DB → UI prop adapter + Lexical-to-HTML | ✅ |
| `src/app/(payload)/custom.css` | Admin panel amber theme | ✅ |
| `src/app/(frontend)/project/[slug]/page.js` | ISR project detail page | ✅ |
| `src/app/(frontend)/project/page.js` | Project listing (category carousels) | ✅ |
| `src/app/(frontend)/blog/[slug]/page.js` | ISR blog detail page | ✅ |
| `src/app/(frontend)/blog/page.js` | Blog listing and journal index page | ✅ |
| `src/app/(frontend)/page.js` | Home page connected to featured projects and blogs | ✅ |
| `src/collections/Products.ts` | Products (Phase 4) | ✅ |
| `src/collections/Careers.ts` | Careers (Phase 5) | ✅ |
| `src/collections/Applications.ts` | Applications (Phase 5) | ✅ |

---

## Data Pipeline

```
MongoDB (Payload)
    │
    ▼  payload.find({ depth: 2 })
Payload Local API       ← Zero HTTP overhead (same Next.js process)
    │
    ▼  projectToDetailProps(doc) / blogToDetailProps(doc)
Adapters (pure fns)     ← Maps Payload shape → component prop shape
    │
    ▼
ISR Server Components   ← Pre-renders at build, on-demand revalidation
    │
    ▼
Existing UI Components  ← ZERO changes to these (BlogHero, BlogBody, Carousel, etc.)
```

---

## Environment Variables

```env
DATABASE_URL=           # MongoDB Atlas connection string (✅)
PAYLOAD_SECRET=         # Secret for Payload auth (✅)
CLOUDINARY_CLOUD_NAME=  # (✅)
CLOUDINARY_API_KEY=     # (✅)
CLOUDINARY_API_SECRET=  # (✅)
```

---

## Completed Phases Log

### Phase 1 — Media
- `Media.ts`, `cloudinary-adapter.ts`, `payload.config.ts`, `custom.css`

### Phase 2 — Project Categories & Projects
- `Categories.ts`, `Projects.ts`, `project-adapter.js`, `/project/[slug]`, `/project`, `Projects.js` prop update

### Phase 3 — Blogs & Rich Text + Homepage Integration
- `Blogs.ts` — Lexical rich text with inline media upload, `lexicalHTMLField`, `date` (auto-set), `author`, `coverImage`, `isFeatured`, `relatedProjects`, `relatedBlogs`
- `Projects.ts` — Added `SlugField` auto-generate button, `isFeatured` checkbox, `relatedBlogs` relationship, `PreviewButton` action
- `SlugField.tsx` — Auto-generate URL slug from Title field
- `PreviewButton.tsx` — Validates required fields before allowing live preview in new tab
- `blog-adapter.js` — Pure adapter mapping Payload document to `BlogHero`, `BlogBody`, `Blog` card, and `Carousel`
- `/blog/[slug]` — ISR detail page with dynamic SEO metadata and related carousels
- `/blog` — Journal index page fetching live CMS blogs with fallback support
- `/` — Homepage connected to live featured projects and featured articles via Payload local API

### Phase 4 — Products CMS + Frontend
- `Products.ts` — Products collection with full schema including images array, specs, customizations configurator, support accordion, isFeatured, M2M relationships
- `product-adapter.js` — Adapter mapping Payload document to detail and card props
- `/products` — ISR listing page grouped by category
- `/products/[slug]` — ISR detail page with ProductDetails.js + carousels

### Phase 5 — Careers & Applications
- `Careers.ts` — Job listings collection with isActive toggle (slug field removed)
- `Applications.ts` — Application inbox, read-only applicant data, status management (new/reviewed/shortlisted/rejected)
- `GET /api/frontend/careers` — Public endpoint returning active listings (60s CDN cache)
- `POST /api/frontend/careers/apply` — Public application submission with full validation
- `/careers` — ISR Careers page (async Server Component + Payload Local API)
- `OpenRoles.js` — Client component with SSR hydration (`initialRoles`), application submission logic, validation handling

### Phase 8 — CMS Preview System ✅ DONE

#### Architecture

Uses **Next.js Draft Mode** + **Payload's native `admin.preview` function**. No custom React component needed — Payload renders its own preview button natively once `admin.preview` is configured.

```
Editor fills fields in CMS
    ↓
Saves document (slug generated)
    ↓
Payload renders native "Preview" button in action bar
    ↓
Editor clicks Preview → opens new tab:
    /api/preview?secret=<PAYLOAD_PREVIEW_SECRET>&collection=projects&slug=my-slug
    ↓
/api/preview route.js validates secret + slug
    ↓
draftMode().enable() → sets __prerender_bypass cookie
    ↓
redirect("/project/my-slug")
    ↓
Project page: draftMode().isEnabled === true
    → Payload Local API fetch bypasses ISR cache
    → PreviewBanner rendered at top of page
    → Editor sees latest saved state of the document
```

#### Files Created / Modified

| File | Role |
|---|---|
| `src/app/api/preview/route.js` | Draft Mode enabler — validates secret + slug, sets cookie, redirects |
| `src/app/api/preview/exit/route.js` | Disables Draft Mode and redirects home or to returnTo path |
| `src/components/payload/PreviewBanner.js` | Fixed amber banner shown at top of page in Draft Mode |
| `src/collections/Projects.ts` | `admin.preview` function → generates preview URL |
| `src/collections/Products.ts` | `admin.preview` function → generates preview URL |
| `src/collections/Blogs.ts` | `admin.preview` function → generates preview URL |
| `src/app/(frontend)/project/[slug]/page.js` | `draftMode()` check + `<PreviewBanner>` |
| `src/app/(frontend)/products/[slug]/page.js` | `draftMode()` check + `<PreviewBanner>` |
| `src/app/(frontend)/blog/[slug]/page.js` | `draftMode()` check + `<PreviewBanner>` |

#### Environment Variables Required

```bash
PAYLOAD_PREVIEW_SECRET=yantra_preview_<random>   # shared secret, server-side only
NEXT_PUBLIC_SERVER_URL=http://localhost:3000       # base URL for preview URLs
```

> **For production:** Set `NEXT_PUBLIC_SERVER_URL=https://your-production-domain.com` in your hosting environment (Vercel, Railway, etc.).

#### Security Model
- Secret validated before Draft Mode is enabled (no open preview endpoints)
- Redirect uses server-validated path (no open redirect via query param)
- `__prerender_bypass` cookie is `HttpOnly` + `SameSite=Lax` (Next.js default)
- Exit route clears the cookie; relative path enforced on `returnTo`

#### How the Preview Button Works
- **Not saved / no slug** → Payload shows no preview button (returns `null`)
- **Saved with slug** → Payload renders its native "Preview" button in the top action bar
- Click → opens `/api/preview?...` in a new tab → Draft Mode enabled → redirected to page
- PreviewBanner appears on page; editor reviews content; clicks "Exit Preview" when done
