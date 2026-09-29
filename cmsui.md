# CMS UI — Component Reference
**Project:** Yantra Skylights & Windows — Internal CMS  
**Design system:** `globals.css` → `--cms-*` tokens (see `cmsdesign.md` for rules)  
**Framework:** Next.js 14 (App Router), vanilla CSS Modules  
**Last updated:** 2026-08-12

---

## Index

| Component | Path | Category |
|---|---|---|
| [CMSButton](#cmsbutton) | `src/components/cms/ui/CMSButton.js` | UI Primitive |
| [CMSInput](#cmsinput) | `src/components/cms/ui/CMSInput.js` | UI Primitive |
| [CMSBadge](#cmsbadge) | `src/components/cms/ui/CMSBadge.js` | UI Primitive |
| [CMSAvatar](#cmsavatar) | `src/components/cms/ui/CMSAvatar.js` | UI Primitive |
| [CMSSpinner](#cmsspinner) | `src/components/cms/ui/CMSSpinner.js` | UI Primitive |
| [CMSSelect](#cmsselect) | `src/components/cms/ui/CMSSelect.js` | UI Primitive |
| [CMSTable](#cmstable) | `src/components/cms/ui/CMSTable.js` | UI Primitive |
| [CMSEmptyState](#cmsemptystate) | `src/components/cms/ui/CMSEmptyState.js` | Feedback |
| [CMSConfirmModal](#cmsconfirmmodal) | `src/components/cms/ui/CMSConfirmModal.js` | Feedback |
| [CMSPageHeader](#cmspageheader) | `src/components/cms/feedback/CMSPageHeader.js` | Feedback |
| [CMSSpecsEditor](#cmsspecseditor) | `src/components/cms/feedback/CMSSpecsEditor.js` | Feedback |
| [CMSRelatedPicker](#cmsrelatedpicker) | `src/components/cms/feedback/CMSRelatedPicker.js` | Feedback |
| [CMSCustomisationEditor](#cmscustomisationeditor) | `src/components/cms/feedback/CMSCustomisationEditor.js` | Feedback |
| [CMSRichTextEditor](#cmsrichtexteditor) | `src/components/cms/blog/CMSRichTextEditor.js` | Blog |
| [CMSTagInput](#cmstaginput) | `src/components/cms/blog/CMSTagInput.js` | Blog |
| [CMSSidebar](#cmssidebar) | `src/components/cms/layout/CMSSidebar.js` | Layout |
| [CMSTopbar](#cmstopbar) | `src/components/cms/layout/CMSTopbar.js` | Layout |
| [CMSShell](#cmsshell) | `src/components/cms/layout/CMSShell.js` | Layout |
| [CMSMediaPicker](#cmsmediapicker) | `src/components/cms/media/CMSMediaPicker.js` | Media |
| [MediaCard](#mediacard) | `src/components/cms/media/MediaCard.js` | Media |
| [MediaGrid](#mediagrid) | `src/components/cms/media/MediaGrid.js` | Media |
| [MediaUploadZone](#mediauploadzone) | `src/components/cms/media/MediaUploadZone.js` | Media |
| [MediaDetailPanel](#mediadetailpanel) | `src/components/cms/media/MediaDetailPanel.js` | Media |

## Utilities

| Utility | Path | Purpose |
|---|---|---|
| [cloudinary-url.js](#cloudinary-url-utility) | `lib/cloudinary-url.js` | Builds Cloudinary transformation URLs client-side |

---

## Pages

| Page | Route | Description |
|---|---|---|
| `src/app/cms/login/page.js` | `/cms/login` | Standalone auth page — NO shell layout |
| `src/app/cms/layout.js` | — | CMS root layout: SessionProvider + SWRProvider + CMSShell |
| `src/app/cms/page.js` | `/cms` | Redirects to `/cms/dashboard` |
| `src/app/cms/dashboard/page.js` | `/cms/dashboard` | Quick-nav landing page |
| `src/app/cms/media/page.js` | `/cms/media` | Media Library full implementation |
| `src/app/cms/(shell)/categories/page.js` | `/cms/categories` | Categories list |
| `src/app/cms/(shell)/categories/[id]/page.js` | `/cms/categories/:id` | Category edit |
| `src/app/cms/(shell)/categories/new/page.js` | `/cms/categories/new` | Category create |
| `src/app/cms/(shell)/products/page.js` | `/cms/products` | Products list (with filter tabs) |
| `src/app/cms/(shell)/products/[id]/page.js` | `/cms/products/:id` | Product edit |
| `src/app/cms/(shell)/products/new/page.js` | `/cms/products/new` | Product create |
| `src/app/cms/(shell)/projects/page.js` | `/cms/projects` | Projects list (with filter tabs) |
| `src/app/cms/(shell)/projects/[id]/page.js` | `/cms/projects/:id` | Project edit |
| `src/app/cms/(shell)/projects/new/page.js` | `/cms/projects/new` | Project create |
| `src/app/cms/(shell)/blog/page.js` | `/cms/blog` | Blog list with cover thumbnails & author |
| `src/app/cms/(shell)/blog/[id]/page.js` | `/cms/blog/:id` | Blog post edit |
| `src/app/cms/(shell)/blog/new/page.js` | `/cms/blog/new` | Blog post create |

---

## Validation Pattern (All CRUDs)

All form pages follow a **dual-validation** approach:

1. **Client-side** — an inline `validate(formData)` function mirrors the Zod schema. Errors are shown per-field immediately after the user touches a field or presses Save. An error banner at the top shows the count.
2. **Server-side** — Zod errors from the API (422 response with `fieldErrors`) are surfaced back to the same per-field UI without re-fetching.

**Required fields for Products:** `title`, `slug`, `subtitle`, `description` (10–400), `imageIds` (≥1), `technicalSpecs` (≥1 entry)  
**Required fields for Projects:** `title`, `slug`, `projectNumber`, `location`, `categoryId`, `storyTitle`, `story`, `storyMedia`, `specifications` (2–5), `imageIds` (≥1)  
**Required fields for Blog:** `title`, `slug`, `coverImageId`, `body`

---

## UI Primitives

### CMSButton

**File:** `src/components/cms/ui/CMSButton.js`

The single button component for all CMS actions. Never create ad-hoc `<button>` elements in CMS screens — always use this.

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'outline'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Height: 30 / 38 / 44px |
| `isLoading` | `boolean` | `false` | Shows spinner, disables interaction |
| `disabled` | `boolean` | `false` | |
| `iconLeft` | `ReactNode` | — | Icon element rendered left of label |
| `iconRight` | `ReactNode` | — | Icon element rendered right of label |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |

**Usage:**
```jsx
import CMSButton from '@/components/cms/ui/CMSButton';

<CMSButton variant="primary" onClick={handleSave}>Save changes</CMSButton>
<CMSButton variant="primary" isLoading={isSaving} type="submit">Publish</CMSButton>
<CMSButton variant="danger" onClick={() => setConfirmOpen(true)}>Delete</CMSButton>
<CMSButton variant="outline" size="sm" onClick={generateSlug}>Auto-generate</CMSButton>
```

**Design rules:**
- One `primary` button per screen maximum (per `cmsdesign.md` §8)
- `danger` variant: outline style at rest, fills red on hover
- `outline` variant: bordered, transparent fill — for secondary actions in headers
- Never use `lg` size for inline table actions — use `sm`

---

### CMSInput

**File:** `src/components/cms/ui/CMSInput.js`

Full-featured input with label, error, hint, character counter, and password toggle.

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Associates `<label>` — always provide |
| `label` | `string` | — | Field label text |
| `type` | `'text' \| 'password' \| 'email' \| 'number'` | `'text'` | Input type |
| `error` | `string` | — | Field-level error (shown in red below) |
| `hint` | `string` | — | Helper text (shown only when no error) |
| `charLimit` | `number` | — | Shows `count/limit` counter when set |
| `required` | `boolean` | `false` | Adds `*` to label |
| `value` | `string` | `''` | Controlled value |

---

### CMSBadge

**File:** `src/components/cms/ui/CMSBadge.js`

Status/label pill. Accepts `variant` prop: `'success'`, `'warning'`, `'danger'`, `'primary'`, `'neutral'`.

**Usage:**
```jsx
<CMSBadge variant="success">Published</CMSBadge>
<CMSBadge variant="warning">Draft</CMSBadge>
<CMSBadge variant="primary">Featured</CMSBadge>
<CMSBadge variant="neutral">{category.name}</CMSBadge>
```

---

### CMSAvatar

**File:** `src/components/cms/ui/CMSAvatar.js`

Initials chip for Admin author display. Color slot (1–6) is deterministic from a hash of the name string.

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | `''` | Full display name |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 28 / 36 / 44px |

---

### CMSSpinner

**File:** `src/components/cms/ui/CMSSpinner.js`

Animated SVG ring spinner. Built into `CMSButton isLoading` or standalone for full-page loading.

**Props:** `size` (`'sm' \| 'md' \| 'lg'`), `label` (string, default `'Loading…'`)

---

### CMSTable

**File:** `src/components/cms/ui/CMSTable.js`

Data table for list views (Products, Categories, Blog, Projects, etc.).

**Props:**
| Prop | Type | Description |
|---|---|---|
| `columns` | `Array` | `[{ key, label, render? }]` — `render(row)` returns ReactNode |
| `data` | `Array` | Row data array |
| `isLoading` | `boolean` | Shows skeleton loading state |
| `onRowClick` | `Function` | Row click handler — receives the row object |
| `emptyState` | `Object` | `{ title, description, actionLabel?, onAction? }` |

---

### CMSSelect

**File:** `src/components/cms/ui/CMSSelect.js`

Standardized dropdown select with label, placeholder, error support.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `id` | `string` | Required for label association |
| `label` | `string` | Field label |
| `options` | `Array` | `[{ value, label }]` |
| `value` | `string` | Selected value |
| `onChange` | `Function` | Called with new value string |
| `placeholder` | `string` | Optional "Choose…" text |
| `error` | `string` | Field error message |
| `required` | `boolean` | Adds `*` to label |

---

## Feedback

### CMSEmptyState

**File:** `src/components/cms/ui/CMSEmptyState.js`

**Props:** `icon` (ReactNode), `heading` (string), `subText` (string), `actionLabel` (string), `onAction` (Function)

> ⚠️ Props are `heading` and `subText` — NOT `title` and `description`.

---

### CMSConfirmModal

**File:** `src/components/cms/ui/CMSConfirmModal.js`

Portal-based confirm/delete modal. Closes on Escape and backdrop click.

**Props:** `isOpen`, `title`, `message`, `confirmLabel` (default `'Delete'`), `onConfirm`, `onCancel`, `isLoading`

> ⚠️ The body text prop is `message` — NOT `description`.

---

### CMSPageHeader

**File:** `src/components/cms/feedback/CMSPageHeader.js`

Every CMS page MUST use this as its h1. `action` slot accepts a ReactNode — pass a `<CMSButton>` directly.

**Props:** `title` (string, required), `description` (string), `action` (ReactNode), `backLink` (string)

---

### CMSSpecsEditor

**File:** `src/components/cms/feedback/CMSSpecsEditor.js`

Dynamic list editor for arrays of objects (e.g. `technicalSpecs [{ property, value }]`).

**Props:**
| Prop | Type | Description |
|---|---|---|
| `value` | `Array` | Current array |
| `onChange` | `Function` | Updated array |
| `fields` | `Array` | `[{ key: 'property', label: 'Property (e.g. Dimensions)' }]` |
| `addButtonText` | `string` | CTA label for the "add row" button |

---

### CMSRelatedPicker

**File:** `src/components/cms/feedback/CMSRelatedPicker.js`

Debounced searchable cross-link selector. Users type to filter, click to add. Selected items shown as removable pill tags.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `value` | `string[]` | Array of selected IDs |
| `options` | `Array` | `[{ value: 'id', label: 'Title' }]` |
| `onChange` | `Function` | Called with updated IDs array |
| `label` | `string` | Section label shown above the search input |
| `placeholder` | `string` | Search input placeholder |

**Behaviour:**
- Debounce: 200ms on each keystroke
- Dropdown shows up to 8 results; "+N more — type to filter" hint if truncated
- Already-selected items are excluded from results
- Backspace on empty input removes the last pill

---

### CMSCustomisationEditor

**File:** `src/components/cms/feedback/CMSCustomisationEditor.js`

Structured builder for product customisation options. Replaces raw JSON textarea.

**Each option group has:**
- `title` — group name (e.g. "Frame Colour")
- `type` — one of `'color'` | `'variant'` | `'toggle'`
- `options` — `Record<string, string>` key → value map

**Props:** `value` (array), `onChange` (Function)

**Type behaviours:**
- `color` — each entry shows a **ColorPickerCell** (see below) instead of a plain hex input. The value stored in `options` is always a normalised 6-char hex string (e.g. `#ff5e1a`).
- `variant` — plain key/label pairs (e.g. `S → Small`, `XL → Extra Large`)
- `toggle` — boolean feature flags (e.g. `motorised → yes`)

**Type selector — segmented chip control:**
The three type buttons (`Color Swatch`, `Variant / Size`, `Toggle / Add-on`) render as a segmented chip group:
- Uses `border-radius: var(--cms-radius-sm)` (not `full`) to signal a control, not a pill/tag
- Active chip: amber fill (`--cms-color-primary-50` bg, `-500` border, `-700` text) + a subtle outer glow (`0 0 0 2px --cms-color-primary-100`) + a checkmark icon
- Inactive hover: `--cms-surface-hover` bg + `--cms-color-primary-300` border, avoiding false "selected" cue
- `aria-pressed` attribute on every button; `role="group"` wrapper for screen-reader context
- Each button renders `<span typeBtnIcon>`, `<span typeBtnLabel>`, and conditionally `<span typeBtnCheck>` — separating icon/label/check for independent styling

**ColorPickerCell (inline color picker sub-component):**
A compound control used in each entry row when `type === 'color'`. It replaces the old manual-hex-only input with:
1. **Swatch button** — 32×32px square with `border-radius: var(--cms-radius-sm)`, background set to the current colour via inline `style`. Clicking it programmatically triggers a visually-hidden `<input type="color">` underneath (using a `ref`). Hover shows an amber focus ring.
2. **Hex text input** — 76px wide, monospace, next to the swatch. Accepts freeform typing; commits on `blur` and `Enter`. Normalises 3-char shorthand (e.g. `#f0a` → `#ff00aa`). Invalid values are silently discarded (state reverts to last known good hex).
3. **Read badge** — After the `→` separator in the entry row, the hex value is shown as a read-only `.entryColorHex` span (monospace, muted, selectable text). This keeps the entry row consistent with non-color entries.

Both the swatch picker and hex text field call `onChange(hex)` on every valid change. The native `<input type="color">` is `pointer-events: none` and triggered via `.click()` on the parent button to avoid double-click issues.

**CSS classes summary (new/changed):**
| Class | Purpose |
|---|---|
| `typeBtn` | Segmented chip base — `radius-sm`, icon+label+check layout |
| `typeBtnActive` | Active state — primary fill + outer glow |
| `typeBtnIcon` | Icon slot inside chip |
| `typeBtnLabel` | Label slot inside chip |
| `typeBtnCheck` | Checkmark slot, visible only when active |
| `colorPickerCell` | Flex wrapper for swatch + hex input |
| `colorSwatch` | Clickable swatch button — bg set via inline style |
| `nativeColorInput` | Visually hidden `input[type=color]` inside swatch |
| `hexInput` | 76px mono hex text input |
| `entryColorHex` | Read-only hex display badge after `→` separator |
| `entryTypeIcon` | Decorative icon in non-color entry rows |

---

## Blog Components

### CMSRichTextEditor

**File:** `src/components/cms/blog/CMSRichTextEditor.js`

Tiptap-powered WYSIWYG editor. Outputs sanitized HTML stored in `Blog.body`. The API route (`POST /api/admin/blogs`) runs `isomorphic-dompurify` as a defense-in-depth layer on top.

**Extensions used:**
- `@tiptap/starter-kit` — paragraph, headings (H2/H3), bold, italic, strike, code, blockquote, bullet/ordered lists, horizontal rule, hard break, undo/redo
- `@tiptap/extension-link` — link insert with `openOnClick: false`, autolinks, `rel=noopener`
- `@tiptap/extension-image` — inline image support (base64 disabled)

**Toolbar actions:** Undo · Redo | H2 · H3 | Bold · Italic · Strike · Code | Bullet list · Numbered list | Blockquote · HR | Add link · Remove link | Word count

**Props:**
| Prop | Type | Description |
|---|---|---|
| `value` | `string` | Controlled HTML string |
| `onChange` | `Function` | Called with updated HTML on every keypress |
| `error` | `string` | Shows a red error bar below the editor |
| `placeholder` | `string` | Placeholder text in empty state |

**Design notes:**
- Toolbar buttons use Lucide React icons at 15px
- Active state: `--cms-color-primary-50` background, `--cms-color-primary-700` color
- Typography inside the editor matches the public blog page (H2 with bottom border, blockquote with left accent, etc.)
- The editor area has `min-height: 380px`

---

### CMSTagInput

**File:** `src/components/cms/blog/CMSTagInput.js`

Comma/Enter/Tab-separated keyword chip input. Used for `Blog.keywords`.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `value` | `string[]` | Controlled array of tags |
| `onChange` | `Function` | Called with updated string[] |
| `label` | `string` | Field label |
| `hint` | `string` | Helper text below the field |
| `placeholder` | `string` | Input placeholder |
| `maxTags` | `number` | Optional maximum tag count (shows `n/max` counter) |

**Behaviour:**
- Tags are auto-lowercased and de-duplicated
- Press `Enter`, `,`, or `Tab` to commit the current input as a tag
- Press `Backspace` on empty input to remove the last tag
- Commas typed mid-string auto-commit immediately

---

## Layout

### CMSSidebar

**File:** `src/components/cms/layout/CMSSidebar.js`

Fixed left navigation rail. Uses **Lucide React** icons throughout.

**Navigation items:**
- Dashboard → `/cms/dashboard` — `LayoutDashboard`
- Products → `/cms/products` — `Package`
- Categories → `/cms/categories` — `Tag`
- Projects → `/cms/projects` — `FolderOpen`
- Blog → `/cms/blog` — `FileText`
- Careers → `/cms/careers` — `Briefcase`
- Media → `/cms/media` — `Image`

**Extending:** Add new items to `NAV_ITEMS` with `{ label, href, Icon }` (import from `lucide-react`). Active items use `strokeWidth={2.5}`; inactive use `strokeWidth={2}`.

---

### CMSTopbar

**File:** `src/components/cms/layout/CMSTopbar.js`

Fixed top bar. Auto-builds breadcrumbs from `usePathname()`. Admin name + avatar + logout dropdown.

**Extending breadcrumbs:** Add new CMS routes to `BREADCRUMB_LABELS` in `CMSTopbar.js`.

---

### CMSShell

**File:** `src/components/cms/layout/CMSShell.js`

Composes Sidebar + Topbar + `<main>`. Implements dual-layer auth guard (middleware + client session check). Only used in `src/app/cms/(shell)/layout.js`.

---

## Media

### CMSMediaPicker

**File:** `src/components/cms/media/CMSMediaPicker.js`

Modal grid overlay to pick assets. Fetches from `GET /api/admin/media` (returns `{ items, total, page, limit }`).

> ⚠️ The API returns a **paginated object**, not a plain array. Always extract `data?.items || []`.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `isOpen` | `boolean` | Controls modal visibility |
| `onSelect` | `Function` | Called with array of selected media docs |
| `onClose` | `Function` | Close handler |
| `multiple` | `boolean` | Multi-selection mode (default: false) |
| `initialSelection` | `string[]` | Pre-selected IDs |

---

### MediaCard / MediaGrid / MediaUploadZone / MediaDetailPanel

See original documentation entries above (unchanged).

---

## Key Design Rules (from `cmsdesign.md`)

1. **All tokens prefixed `--cms-`** — never read marketing tokens (`--fs-*`, `--color-*`)
2. **One primary-colored element per screen** — never two primary buttons visible at once
3. **Status colors only via `CMSBadge`** — never inline hex for status
4. **4px spacing grid** — only `--cms-space-*` values; no hardcoded pixel offsets
5. **Radius signals weight** — `xs/sm` for controls, `md` for cards, `lg` for modals, `full` for pills
6. **Focus rings always visible** — `--cms-shadow-focus-ring` on every interactive element
7. **Short durations** — 120–260ms only; nothing should feel like it's performing
8. **Icons from Lucide React** — always `import { IconName } from 'lucide-react'`. Sidebar active icons use `strokeWidth={2.5}`, rest use `strokeWidth={2}` or `1.5` for decorative.
9. **Form layout** — two-column grid (`1fr 300px`), `position: sticky` sidebar, sections as `<section>` cards
10. **Toggles** — always use the custom `toggleSwitch/toggleThumb` pattern; never `<input type="checkbox">` for prominent settings

---

## Known Gotchas

| Issue | Resolution |
|---|---|
| `useMedia()` returns `{ items, total }` not an array | Always use `data?.items \|\| []` |
| `useBlogs()` was importing non-existent `fetcher` | Fixed — now uses `apiClient.get` |
| `CMSConfirmModal` prop is `message` not `description` | Always pass `message` |
| `CMSEmptyState` props are `heading`/`subText` not `title`/`description` | Always use correct prop names |
| `CMSPageHeader` `action` prop must be a ReactNode | Pass `<CMSButton>` directly, not a plain object `{ label, onClick }` |
| Toast hook exports `{ toast }` not `{ addToast }` | Call `toast({ type, message })` |
| API route relative imports break when nesting is deep | Use `@/lib/prisma` and `@/lib/api-helpers` via the `@/` alias in all API routes |

---

## Careers Module

The Careers section has **two sub-views** on a single page (`/cms/careers`), toggled by a tab bar:

1. **Job Listings** — create, edit, activate/deactivate career opportunities
2. **Applications** — a card-based inbox to review and status-manage submitted applications

---

### CareerForm

**File:** `src/components/cms/careers/CareerForm.js`

Create/edit form for individual job listings.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `career` | `Object \| null` | Existing career document (null for new) |
| `isNew` | `boolean` | Switches between create/edit mode |

**Features:**
- Role title, slug (with auto-generate), Department, Location — all required
- **Department autocomplete** — typing into the Department field shows a dropdown of preset suggestions (`Engineering`, `Design`, `Sales`, etc.); click to select
- Free-text job description textarea (min 20 chars)  
- `isActive` toggle — controls public visibility without deleting
- On edit view, sidebar shows total application count with a quick-link to the Applications tab
- Delete button triggers `CMSConfirmModal` which warns that all applications will also be deleted (cascade)

**Validation (client + server):** `role`, `slug`, `field`, `location`, `description` (≥20 chars) are all required.

---

### ApplicationsView

**File:** `src/components/cms/careers/ApplicationsView.js`

Card-based inbox for managing incoming career form submissions.

**Features:**
- **Status filter pills** — All · New · Reviewed · Shortlisted · Rejected — with live counts per status
- **Role filter dropdown** — filter to a specific career listing
- **Status change dropdown** — click the current status badge to open a context menu; selecting a new status PATCHes the application immediately (optimistic UI via SWR `mutate`)
- **Expandable cover note** — accordion toggle reveals the applicant's cover letter inline
- **Direct links** — `mailto:`, `tel:`, and Google Drive resume link rendered as anchor tags
- **Application card** left-border color is coded by status: blue = new, amber = reviewed, green = shortlisted, red = rejected
- **Pagination** — 25 per page
- **Delete** — `CMSConfirmModal` confirming permanent removal

---

### useCareers Hook

**File:** `lib/hooks/useCareers.js`

| Export | Type | Description |
|---|---|---|
| `useCareers(filters)` | SWR hook | Paginated career listings list |
| `useCareer(id)` | SWR hook | Single career listing |
| `useApplications(filters)` | SWR hook | All applications (global, all roles) |
| `useCareerApplications(careerId, filters)` | SWR hook | Applications for a specific career |
| `createCareer(data)` | Mutation | POST `/api/admin/careers` |
| `updateCareer(id, data)` | Mutation | PATCH `/api/admin/careers/:id` |
| `deleteCareer(id)` | Mutation | DELETE `/api/admin/careers/:id` |
| `updateApplicationStatus(appId, status)` | Mutation | PATCH `/api/admin/careers/applications/:appId` |
| `deleteApplication(appId)` | Mutation | DELETE `/api/admin/careers/applications/:appId` |

---

### API Routes (Careers)

All routes hardened with Zod validation and `apiError`/`parseAndValidate` helpers:

| Route | Method | Description |
|---|---|---|
| `/api/admin/careers` | GET | Paginated listings. Supports `?isActive=`, `?page=`, `?limit=`. Returns `{ items, total }` with `_count.applications` |
| `/api/admin/careers` | POST | Create listing. Validated against `careerSchema` |
| `/api/admin/careers/:id` | GET | Single listing with `_count` |
| `/api/admin/careers/:id` | PATCH | Update listing. Validated against `careerUpdateSchema` |
| `/api/admin/careers/:id` | DELETE | Deletes listing + cascades `deleteMany` on applications |
| `/api/admin/careers/applications` | GET | All applications. Supports `?status=`, `?careerId=`, pagination |
| `/api/admin/careers/applications/:appId` | GET | Single application |
| `/api/admin/careers/applications/:appId` | PATCH | Update `status` only. Zod enum validates `new\|reviewed\|shortlisted\|rejected` |
| `/api/admin/careers/applications/:appId` | DELETE | Permanently removes an application |

> ⚠️ **Import rule:** Always use `@/lib/prisma` and `@/lib/api-helpers` in API routes. Relative `../../` paths break at nesting depths beyond 5 levels.

---

### Pages (Careers)

| Page | Route | Description |
|---|---|---|
| `src/app/cms/(shell)/careers/page.js` | `/cms/careers` | Two-tab page: Listings + Applications |
| `src/app/cms/(shell)/careers/new/page.js` | `/cms/careers/new` | Create new listing |
| `src/app/cms/(shell)/careers/[id]/page.js` | `/cms/careers/:id` | Edit listing |

The main page accepts `?tab=applications` in the URL — e.g. the "View Applications" button in `CareerForm` routes there directly.

