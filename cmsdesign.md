# CMS Design System — Skylights & Windows Admin

A design guide for anyone building screens on top of `cms-globals.css`.
This governs the **internal CMS only** (Products, Projects, Blog, Careers,
Media, Admin). It does not touch, and should never be confused with, the
public marketing site's design system.

---

## 1. Why this exists, and the thesis

The CMS is a tool, not a brand surface — but "tool" doesn't have to mean
generic Bootstrap-grey admin panel. The one deliberate choice in this
system is the palette: **"sunlight through glass."** A warm amber/sunbeam
primary (`--cms-color-primary-*`) against cool glass-and-aluminum neutrals
(`--cms-color-neutral-*`), with a sky-blue reserved strictly for links and
informational states. It's a quiet nod to what this company actually makes
(skylights let sunlight through glass) without turning the admin tool into
a marketing moment. Everything else — type scale, spacing, radius — is
built for density and clarity first, personality second.

**Typeface:** Inter, via `--cms-font-sans` → `var(--font-alfa)`. This is
the *only* thing reused from the marketing site on purpose. Two products,
one typographic voice.

---

## 2. Namespacing rule (non-negotiable)

Every CMS token is prefixed `--cms-`. Never:
- Read a marketing token (`--fs-h1`, `--color-grey`, etc.) directly inside
  a CMS component.
- Add a new token to `:root` without the `--cms-` prefix.
- Rename or delete anything in the original `global.css` block. If a CMS
  screen needs something the marketing tokens already define (e.g. a font),
  re-expose it under a `--cms-` alias like we did with `--cms-font-sans`,
  don't reach across.

This keeps the two design systems swappable independently — if the
marketing site rebrands, the CMS doesn't inherit it by accident, and vice
versa.

---

## 3. Color — how to actually use it

| Token group | Use for | Never use for |
|---|---|---|
| `--cms-color-primary-*` | Primary buttons, active nav/tab indicator, focus rings, "Featured" badge | Body text, large fills, error states |
| `--cms-color-sky-*` | Links, info banners, secondary/ghost buttons | Primary CTAs (keep exactly one primary color per screen) |
| `--cms-color-neutral-*` | Text, borders, surfaces, dividers | Status meaning (grey ≠ "inactive" on its own — use the status aliases) |
| `--cms-status-*-fg` / `-bg` | Badges/pills tied to schema state | Anything decorative — these are semantic, not palette shortcuts |
| `--cms-avatar-bg/fg-1..6` | Initials chips (Admin authors, contacts) | Status meaning — avatar color is identity, not state |

### Status badge mapping (derived directly from the Prisma schema)

| Schema field | Value | Token pair |
|---|---|---|
| `Product.isPublished` / `Project.isPublished` / `Blog.isPublished` | `true` | `--cms-status-published-*` |
| same fields | `false` | `--cms-status-draft-*` |
| `Product.isFeatured` / `Project.isFeatured` | `true` | `--cms-status-featured-*` |
| `Career.isActive` | `true` | `--cms-status-active-*` |
| `Career.isActive` | `false` | `--cms-status-inactive-*` |
| `CareerApplication.status` | `"new"` | `--cms-status-new-*` |
| same | `"reviewed"` | `--cms-status-reviewed-*` |
| same | `"shortlisted"` | `--cms-status-shortlisted-*` |
| same | `"rejected"` | `--cms-status-rejected-*` |

**Rule:** components resolve status → badge color via a single lookup
object/switch, never inline hex, never inline conditional Tailwind classes
scattered across files. One source of truth = one place to change tone
later (e.g. if legal wants "rejected" softened from red to grey).

### Don't invent new status colors

If a future model adds a new enum value ("archived", "in-review", etc.),
add a new `--cms-status-*` pair using the *existing* raw palette
(`success`/`warning`/`danger`/`info`/`neutral`) — don't introduce a new hue.
Six palette families is already enough to stay legible; more hues just
makes the status column noisier to scan.

---

## 4. Typography rules

- Base body/table/inputs = `--cms-fs-base` (14px). This is the workhorse
  size — most of the UI should be this or `--cms-fs-sm` (13px) for dense
  table cells.
- Page titles ("Products", "Projects") = `--cms-fs-4xl` / `--cms-fw-bold`.
  One per screen. Don't also bold a subtitle at the same size — establish
  one clear hierarchy per view (Don Norman: a system should map cleanly to
  a single mental model; competing "loudest elements" break that mapping).
- All-caps labels (table headers, section eyebrows) always pair
  `--cms-tracking-wide` with `--cms-fs-xs` or smaller. Never all-caps at
  body size — it reads as shouting and hurts scanning speed in a table.
- Line height: tight (`1.2`) only on single-line headings. Anything that
  wraps (descriptions, blog body preview, story text) gets `--cms-lh-relaxed`.

---

## 5. Spacing & layout

- Everything sits on the 4px grid (`--cms-space-*`). If a value doesn't
  exist in the scale, that's a signal to reconsider the layout, not to
  hardcode a one-off pixel value.
- Table row height defaults to `--cms-table-row-height` (64px) — enough
  for a two-line cell (name + email/slug pattern, like Product title +
  subtitle). Don't shrink this per-table; use the `data-density="compact"`
  variant globally if a screen truly needs more rows visible.
- Sidebar, topbar, and content max-width are fixed tokens
  (`--cms-sidebar-width`, `--cms-topbar-height`, `--cms-content-max-width`)
  precisely so every screen (Products list, Project editor, Blog editor,
  Career applications) shares one shell. Visibility of system status
  (Norman's principle #1) depends on the chrome never shifting between
  sections — people should always know where they are in the CMS without
  re-orienting.

---

## 6. Elevation, radius, motion

- Radius scale maps to component weight: `xs`/`sm` for interactive
  controls (inputs, buttons), `md` for cards, `lg` for modals/drawers,
  `full` for pills/avatars/dots. Don't mix — a button with `--cms-radius-lg`
  next to inputs with `--cms-radius-xs` reads as inconsistent, not intentional.
- Shadows increase with elevation, not with importance. A primary button
  doesn't need `--cms-shadow-lg` just because it's the primary action —
  reserve heavier shadows for things that visually float above the page
  (modals, dropdowns, toasts).
- Motion durations are short on purpose (120–260ms). This is a
  data-entry tool used daily by the internal team; nothing should feel
  like it's performing for them. If an interaction needs more than
  `--cms-duration-slow` to read clearly, the interaction itself is the
  problem, not the timing.

---

## 7. Accessibility & feedback (Norman, applied)

- **Visibility of system status:** every async action (save, publish,
  delete, upload to Media) needs an explicit state — use
  `--cms-status-*` tokens for inline confirmation, never rely on the
  action just "looking done."
- **Constraints & error prevention:** Product `description` (~360 char),
  Project `title` (150 char), Project `specifications` (2–5 items) are
  zod-enforced server-side per the schema comments — but the *UI* should
  show the constraint before submit (character counters, disabled "add
  spec" button past 5), not only reject after the fact.
- Focus states always use `--cms-shadow-focus-ring` +
  `--cms-border-focus`. Never remove focus outlines for aesthetic reasons
  — this is an internal tool used for hours at a time; keyboard nav must
  stay legible.
- Minimum contrast: all `--cms-status-*-fg` colors are tuned against
  their paired `-bg`, and all `--cms-text-*` tokens against
  `--cms-surface-card`/`--cms-surface-app` — if you introduce a new
  text/surface pairing, check contrast before shipping it, don't assume.

---

## 8. Do / Don't summary

**Do**
- Prefix every new token `--cms-`.
- Route all status colors through the `--cms-status-*` aliases.
- Keep one primary-colored element per screen (button or active nav item).
- Use the 4px spacing scale for everything, no exceptions.
- Reuse `--cms-font-sans` everywhere; never introduce a second typeface.

**Don't**
- Don't touch or reference the marketing site's `--fs-*` / `--color-*` tokens.
- Don't hardcode hex values in components — if a color isn't a token yet,
  add it to `cms-globals.css` first, then use it.
- Don't invent new accent hues for one-off features — extend the existing
  six palette families instead.
- Don't use `--cms-radius-lg`/`xl` on small interactive controls, or `xs`/`sm`
  on modals — radius signals component weight, keep it consistent.
- Don't build a second sidebar width, topbar height, or content max-width
  per section — one shell, every screen.

---

## 9. Extending this system

Adding a genuinely new need (e.g. a calendar view, a kanban board for
Career applications)? Add tokens in the matching numbered section of
`cms-globals.css`, following the existing naming pattern
(`--cms-<category>-<variant>`), and document the addition here under the
relevant section — don't create a parallel, differently-named token file.
One system, one file, one guide.