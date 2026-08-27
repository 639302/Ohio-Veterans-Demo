# Ohio Veterans — Style Guide

Reference document for the Ohio Veterans agentic prototype. Sourced from the official [Ohio Brand Guide v1.9](reference/Ohio-Brand_Guide-v1-9.pdf) (color, typography) and the [MMS Design System typographic framework](https://638088.github.io/mms-ds-storybook/?path=/story/foundations-typography--typographic-framework) (heading scale/usage, semantic/utility color tokens).

**CSS custom properties for all colors live in [`tokens.css`](tokens.css)** — reference actual `var(--...)` names from there when writing HTML/CSS, rather than hardcoding hex values.

---

## Color Palette

### Primary Palette
Inspired by the state flag (the Ohio burgee).

| Name | Hex | RGB | CMYK Coated | Pantone Coated |
|---|---|---|---|---|
| **Buckeye Blue** | `#0E3F75` | 14, 63, 117 | 100, 74, 0, 45 | 294 C |
| **Cardinal Red** | `#C12637` | 193, 38, 55 | 0, 100, 76, 13 | 200 C |
| **White** | `#FFFFFF` | 255, 255, 255 | 0, 0, 0, 0 | — |

**Restriction:** Do not pair Cardinal Red and Buckeye Blue in a way that visually vibrates (e.g., thin adjacent stripes at full saturation). Tints are permitted for all primary colors **except Cardinal Red**, which should only be used at full strength.

### Secondary Palette
Cool and warm tones for accents and seasonal/contextual variation. **Never use as the dominant/predominant color of a design** — primary palette leads, secondary supports.

| Name | Hex | RGB | CMYK Coated | Pantone Coated |
|---|---|---|---|---|
| **Earth Brown** | `#8A5E32` | 138, 94, 50 | 7, 53, 89, 42 | 464 C |
| **Tech Blue** | `#0098D3` | 0, 152, 211 | 91, 17, 0, 0 | 2192 C |
| **Quarry Blue** | `#69C2C6` | 105, 194, 198 | 60, 0, 16, 0 | 2227 C |
| **Black** | `#000000` | 0, 0, 0 | 40, 40, 40, 100 | — |
| **Circleville Orange** | `#EBA70E` | 235, 167, 14 | 0, 32, 100, 0 | 130 C |
| **Solar Yellow** | `#F3DF89` | 243, 223, 137 | 0, 4, 48, 0 | 1205 C |
| **Monumental Gray** | `#B0B3AF` | 176, 179, 175 | 28, 21, 18, 1 | Cool Gray 5 C |
| **Appalachian Green** | `#729364` | 114, 147, 100 | 53, 14, 59, 15 | 2263 C |
| **Pawpaw Green** | `#BBD36F` | 187, 211, 111 | 29, 0, 64, 0 | 366 C |

### Usage Notes
- Do not introduce any color outside this palette.
- Tints (lighter percentages) are allowed for all colors except Cardinal Red.
- For the veterans prototype: lead with **Buckeye Blue** and **White** as the dominant UI colors, use **Cardinal Red** sparingly for emphasis/CTAs, and pull secondary tones (Tech Blue, Monumental Gray, Appalachian Green) for supporting UI states, charts, or category tags — never as the primary background or brand color.

---

## Semantic & Utility Color System

The Ohio brand palette above defines *what colors exist*. This section defines *what role each color plays in the UI* — a separate, accessibility-critical layer that stays fixed regardless of brand (from the MMS Design System). Full tokens: [`tokens.css`](tokens.css).

### Neutral Scale (12-step, Light + Dark)
Used for page/surface backgrounds, borders, dividers, and body text — not brand-colored.

| Step | Token | Light Hex | Dark Hex | Purpose |
|---|---|---|---|---|
| 1 | `--color-neutral-1` | `#fcfcfc` | `#060606` | Page — body background |
| 2 | `--color-neutral-2` | `#f9f9f9` | `#151515` | Surface — cards, sidebars, panels |
| 3 | `--color-neutral-3` | `#f0f0f0` | `#191919` | Element — ghost button, list item default |
| 4 | `--color-neutral-4` | `#e8e8e8` | `#1d1d1d` | Element hovered |
| 5 | `--color-neutral-5` | `#e0e0e0` | `#262626` | Element pressed — selected item |
| 6 | `--color-neutral-6` | `#b8b8b8` | `#444444` | Separator — dividers, card borders |
| 7 | `--color-neutral-7` | `#878787` | `#636363` | Border — input borders, button outlines |
| 8 | `--color-neutral-8` | `#737373` | `#7d7d7d` | Border hovered — emphasized outlines |
| 9 | `--color-neutral-9` | `#606060` | `#979797` | Solid (anchor) — filled elements |
| 10 | `--color-neutral-10` | `#484848` | `#b0b0b0` | Solid hovered |
| 11 | `--color-neutral-11` | `#303030` | `#cacaca` | Text muted — secondary text, captions |
| 12 | `--color-neutral-12` | `#1a1a1a` | `#e3e3e3` | Text — body, headings |

Dark mode is toggled via `[data-mode="dark"]` on a root element (e.g. `<html>`).

### Status Colors (fixed across all themes)
Each status has a **muted** tier (surface background) and **emphasis** tier (text/borders/icons).

| Status | Muted | Emphasis |
|---|---|---|
| Success | `--color-utility-success-muted` `#c6f3c6` | `--color-utility-success-emphasis` `#0e580e` |
| Error | `--color-utility-error-muted` `#f3ac99` | `--color-utility-error-emphasis` `#aa010e` |
| Caution | `--color-utility-caution-muted` `#faf3d1` | `--color-utility-caution-emphasis` `#936f38` (USWDS warning-darker) |
| Informational | `--color-utility-informational-surface/stroke/text` → references neutral-3/6/11 (auto-swaps in dark mode) | |

**Why fixed?** Status feedback (success/error/caution) and accessibility indicators (focus ring) must communicate consistently — a success message should look like a success message everywhere, and a focus ring must always be visible for keyboard users. These are never re-skinned with brand colors.

### Links (structural, not brand-dependent, WCAG AA)

| Token | Light | Dark | Contrast |
|---|---|---|---|
| `--color-utility-link` | `#005ea2` | `#58b4ff` | 4.54:1 / 7.5:1 on background |
| `--color-utility-link-hover` | `#0b4778` | `#a9d6ff` | 8.18:1 / 11.2:1 |
| `--color-utility-link-visited` | `#54278f` | `#c9b6e4` | 7.28:1 / 8.9:1 |

### Other Utility Tokens
| Token | Value | Usage |
|---|---|---|
| `--color-text-placeholder` | `#6d6d6d` (light) / `#8c8c8c` (dark) | Form input placeholder text, tuned for 4.5:1 contrast |
| `--color-utility-on-fill` | `#ffffff` | White text/icons on emphasis fills |
| `--color-utility-notification` | `#aa010e` | Badge/indicator fill |

### Focus Ring (structural, non-negotiable — WCAG 2.2 / Section 508)
The focus ring is a shared primitive, never overridden by brand or theme. Satisfies WCAG 2.2 SC 2.4.11 (Focus Appearance) and SC 1.4.11 (Non-text Contrast), and Section 508 / ADA Title II.

| Token | Value | Usage |
|---|---|---|
| `--focus-ring-width` | `2px` | WCAG 2.2 SC 2.4.11 minimum; applied as outline-width |
| `--focus-ring-style` | `solid` | Maximum visibility across backgrounds |
| `--focus-ring-color` | `#386CF7` | 3:1 contrast against white/light surfaces |
| `--focus-ring-offset` | `2px` | External offset — buttons, links, checkboxes, radios |
| `--focus-ring-inset-offset` | `-2px` | Inset offset for bordered elements — text field, select |

---

## Component Color Mapping

Decisions on which token plays which UI role (the brand palette alone doesn't specify this):

| Role | Token | Rationale |
|---|---|---|
| Primary button background | `--color-primary-9` (`#0e3f75`, = `--color-brand-buckeye-blue`) | **Decision:** Cardinal Red is reserved for accents only (or not used at all) — it reads too close to the error-state red (`--color-utility-error-emphasis` `#aa010e`) and risks being misread as a destructive/error action. |
| Primary button text | `--color-utility-on-fill` (`#ffffff`) | Standard white-on-fill text. Contrast of anchor vs. white: 10.57:1 |
| Primary button hover | `--color-primary-10` (`#00295b`) | Solid hovered — from the generated 12-step primary scale (anchor = step 9) |
| Primary button active/pressed | `--color-primary-10` (`#00295b`) | Scale defines only default/hover solid steps (same pattern as the neutral scale) — active reuses hover value unless a deeper press state is requested |
| Accent / secondary emphasis | `--color-brand-cardinal-red` | Sparing use only — badges, small icon accents, never a button fill |
| Outline/ghost button — element states | `--color-primary-3` / `-4` / `-5` (element / hovered / pressed) | Mirrors neutral scale's ghost-button pattern, tinted primary instead of gray |
| Outline/ghost button — border | `--color-primary-7` / `-8` (border / border hovered) | |
| Links | `--color-utility-link` / `-hover` / `-visited` | Fixed USWDS-aligned tokens (not brand blue) — keeps link recognizability and WCAG AA contrast guaranteed regardless of brand skin |
| Disabled controls | `--color-neutral-5` bg / `--color-neutral-8` text | Standard neutral-scale disabled pattern; disabled state never uses brand color |

### Primary Color Scale (Buckeye Blue anchor, 12-step)
Generated the same way as the neutral scale — Buckeye Blue (`#0E3F75`) set as the step-9 anchor. Contrast of anchor vs. white: **10.57:1**.

| Step | Token | Light Hex | Dark Hex | Purpose |
|---|---|---|---|---|
| 1 | `--color-primary-1` | `#f6fbff` | `#03060c` | Page |
| 2 | `--color-primary-2` | `#eef4fc` | `#0f151d` | Surface |
| 3 | `--color-primary-3` | `#e2ecfa` | `#0f1a27` | Element |
| 4 | `--color-primary-4` | `#d6e4f7` | `#0f1e30` | Element hovered |
| 5 | `--color-primary-5` | `#c9dbf2` | `#15273e` | Element pressed |
| 6 | `--color-primary-6` | `#b0c6e3` | `#182f4b` | Separator |
| 7 | `--color-primary-7` | `#95b0d3` | `#264162` | Border |
| 8 | `--color-primary-8` | `#799bc6` | `#33547d` | Border hovered |
| 9 | `--color-primary-9` | `#0e3f75` | `#27568e` | Solid (anchor) |
| 10 | `--color-primary-10` | `#00295b` | `#416ea4` | Solid hovered |
| 11 | `--color-primary-11` | `#355780` | `#8cb1e0` | Text muted |
| 12 | `--color-primary-12` | `#162f4d` | `#c2e1ff` | Text |

Note the dark-mode anchor (step 9, `#27568e`) is brighter than the light-mode brand hex — needed for sufficient contrast against dark backgrounds; this is the same anchor-brightening pattern used for links in dark mode.

**Resolved:** links use the fixed USWDS-style blue (`--color-utility-link`), not Buckeye Blue — confirmed 2026-08-07.

---

## Layout & Structural Tokens

Spacing, sizing, radius, and elevation are **structural UX decisions that don't change per brand/theme** — same source as the color utility layer. Full tokens: [`tokens.css`](tokens.css).

### Spacing (gaps, margins, padding between elements)

| Token | px | rem |
|---|---|---|
| `--spacing-0` | 0 | 0rem |
| `--spacing-px` | 1 | 0.0625rem |
| `--spacing-xs1` | 2 | 0.125rem |
| `--spacing-xs0` | 3 | 0.1875rem |
| `--spacing-xs2` | 4 | 0.25rem |
| `--spacing-sm1` | 8 | 0.5rem |
| `--spacing-sm2` | 12 | 0.75rem |
| `--spacing-md1` | 16 | 1rem |
| `--spacing-md2` | 20 | 1.25rem |
| `--spacing-lg1` | 24 | 1.5rem |
| `--spacing-lg-mid` | 28 | 1.75rem |
| `--spacing-lg2` | 32 | 2rem |
| `--spacing-xl1` | 40 | 2.5rem |
| `--spacing-xl2` | 48 | 3rem |
| `--spacing-xl3` | 56 | 3.5rem |
| `--spacing-xxl1` | 64 | 4rem |
| `--spacing-xxl2` | 72 | 4.5rem |
| `--spacing-xxl3` | 96 | 6rem |
| `--spacing-xxl4` | 128 | 8rem |

### Size (dimensions of elements — icons, controls, touch targets, avatars)
Mirrors the spacing scale where values overlap, plus additions for WCAG touch targets and common component sizes. Component-specific dimensions (e.g. a date-picker width) stay at the component level, not here.

| Token | px | Use case |
|---|---|---|
| `--size-0` | 0 | zero utility |
| `--size-px` | 1 | borders, hairlines |
| `--size-xs1` | 2 | — |
| `--size-xs0` | 3 | small details |
| `--size-xs2` | 4 | — |
| `--size-sm0` | 6 | small elements |
| `--size-sm1` | 8 | radio dot, small icons |
| `--size-sm2` | 12 | small icons, indicators |
| `--size-md1` | 16 | icons, checkbox indicator |
| `--size-md2` | 20 | toggle thumb |
| `--size-lg1` | 24 | icons, touch areas |
| `--size-lg-28` | 28 | accordion/grid indent |
| `--size-lg2` | 32 | desktop touch target |
| `--size-xl1` | 40 | large controls |
| `--size-xl-touch` | **44** | **WCAG mobile touch target minimum** |
| `--size-xl2` | 48 | toggle width, controls |
| `--size-xl3` | 56 | larger controls |
| `--size-xxl1` | 64 | avatars |
| `--size-xxl2` | 80 | large avatars |
| `--size-xxl3` | 96 | extra large avatars |
| `--size-xxl4` | 128 | hero elements |

> **Spacing vs. Size:** spacing = gaps/margins/padding *between* elements; size = width/height *of* elements. Example: a 32px icon uses `--size-lg2`, but the 32px gap around it uses `--spacing-lg2`.

### Radius (corner curvature — structural, fixed across themes)

| Token | px | rem |
|---|---|---|
| `--radius-none` | 0 | 0rem |
| `--radius-xs` | 2 | 0.125rem |
| `--radius-sm` | 4 | 0.25rem |
| `--radius-md` | 8 | 0.5rem |
| `--radius-lg` | 16 | 1rem |
| `--radius-full` | 1000 | — (pill/circle) |

### Elevation (shadow scale — structural, fixed across themes)

| Token | Value | Usage |
|---|---|---|
| `--elevation-none` | `none` | Flat surfaces — no lift |
| `--elevation-sm` | `0 1px 3px 1px rgba(0,0,0,.15), 0 1px 2px 0 rgba(0,0,0,.30)` | Cards at rest, subtle lift |
| `--elevation-md` | `0 2px 6px 2px rgba(0,0,0,.15), 0 1px 2px 0 rgba(0,0,0,.30)` | Dropdowns, popovers |
| `--elevation-lg` | `0 4px 8px 3px rgba(0,0,0,.15), 0 1px 3px 0 rgba(0,0,0,.30)` | Modals, drawers |
| `--elevation-xl` | `0 6px 10px 4px rgba(0,0,0,.15), 0 2px 3px 0 rgba(0,0,0,.30)` | Top-level overlays, dialogs |

### Layout — Content Container & Breakpoint

| Token | Value | Purpose |
|---|---|---|
| `--layout-content-max-width` | `1280px` | Content stops growing past this width, regardless of viewport |
| `--layout-inline-padding-compact` | `16px` | Horizontal padding below the padding step |
| `--layout-inline-padding-default` | `24px` | Horizontal padding at/above the padding step |
| `--layout-padding-step` | `768px` | Viewport width where padding transitions compact → default |
| `--layout-gap-tight` | `8px` (`--spacing-sm1`) | Chips, icon+label pairs, inline form controls |
| `--layout-gap-default` | `16px` (`--spacing-md1`) | List items, form fields, nav items |
| `--layout-gap-loose` | `24px` (`--spacing-lg1`) | Cards, larger composite groups |
| `--layout-gap-comfortable` | `32px` (`--spacing-lg2`) | Major composite blocks, card-grid items |

**Note:** `768px` and `1280px` are the only two breakpoints confirmed by the design-system screenshots (padding step + container cap). No formal sm/md/lg/xl scale was provided, so the table below is a **proposed default** — a standard 5-step scale anchored to the two confirmed values — for general responsive layout (grids, nav collapse, etc.) beyond just the content container. Swap it out if your framework already has one.

| Token | Value | Typical use |
|---|---|---|
| `--breakpoint-sm` | 640px | Small tablets / large phones |
| `--breakpoint-md` | 768px | **Confirmed** — tablets (= `--layout-padding-step`) |
| `--breakpoint-lg` | 1024px | Small laptops |
| `--breakpoint-xl` | 1280px | **Confirmed** — desktop (= `--layout-content-max-width`) |
| `--breakpoint-2xl` | 1536px | Large desktop |

---

## Typography

### Typefaces
- **Primary — Source Sans 3** (Google Fonts, open source). Use for all headlines, subheads, and body copy.
- **Secondary — Source Serif 4** (Google Fonts, open source). Use minimally, as a complement to Source Sans 3 — well suited to long-format content (documents, letters). Not for UI chrome.

> When installing from Google Fonts, use the **static** weight files (Light, Regular, Bold, etc.), not the variable font — variable fonts aren't fully supported across all target apps.

### Font Loading
Both typefaces are free on Google Fonts. Only the weights actually used in this system (400/500/700, per the font-weight tokens) need to load — no need to pull the full family.

**Option A — Google Fonts CDN (fastest to wire up for a demo):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;700&family=Source+Serif+4:wght@400;500;700&display=swap" rel="stylesheet">
```
```css
--font-family-primary: 'Source Sans 3', system-ui, sans-serif;
--font-family-secondary: 'Source Serif 4', Georgia, serif;
```

**Option B — self-hosted static files (matches the brand PDF's "use static, not variable" guidance more literally):** download the static weight files (Regular/Medium/Bold, and their italics if needed) from Google Fonts, then:
```css
@font-face {
  font-family: 'Source Sans 3';
  src: url('/fonts/SourceSans3-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
/* repeat per weight/style */
```
For the prototype, Option A is simplest; switch to Option B only if offline/self-hosting becomes a requirement.

### Type Mechanics
| Property | Spec |
|---|---|
| Kerning | Optical |
| Tracking | -5 for body copy, light/regular weights |
| Leading | Comfortable — avoid too tight or too loose |
| Alignment | Left-aligned, ragged right (preferred). Centered okay when appropriate. **Never justify.** |
| Line length | Avoid lines that are too long or too short (readability) |
| Weight contrast | Skip a weight between hierarchy levels (e.g., headline vs. subhead) for clear contrast, or use color to reinforce contrast |
| Proportions | Never stretch, condense, or expand the typefaces |

### Type Scale (from MMS Design System Typographic Framework)
Line heights are baked into each type level — no standalone tokens, guaranteeing consistent vertical rhythm. **Font family for all levels below = Source Sans 3** (bold/heading weights per Ohio brand primary style); Source Serif 4 may be substituted for long-form body copy only, per Ohio brand secondary-style guidance.

**Display — Hero/Marketing**

| Token | rem | px | Line-height | Usage |
|---|---|---|---|---|
| `--text-display-lg` | 3.5rem | 56px | 1.1 | Hero taglines, splash screens |
| `--text-display-md` | 2.75rem | 44px | 1.15 | Feature callouts, section heroes |
| `--text-display-sm` | 2.25rem | 36px | 1.2 | Secondary hero text, card heroes |

**Heading — Semantic (H1–H6)**

| Token | rem | px | Line-height | Usage |
|---|---|---|---|---|
| `--text-heading-1` | 2.5rem | 40px | 1.2 | Page title (h1) |
| `--text-heading-2` | 2rem | 32px | 1.25 | Major section (h2) |
| `--text-heading-3` | 1.5rem | 24px | 1.3 | Subsection (h3) |
| `--text-heading-4` | 1.25rem | 20px | 1.35 | Card/panel title (h4) |
| `--text-heading-5` | 1.125rem | 18px | 1.4 | Minor heading (h5) |
| `--text-heading-6` | 1rem | 16px | 1.45 | Smallest heading (h6) |

**Content guidance:** Most pages need only h1–h4. Avoid nesting beyond four heading levels — deeper hierarchy usually signals a need to restructure the page or split content into separate sections.

**Body — Running Prose**

| Token | rem | px | Line-height | Usage |
|---|---|---|---|---|
| `--text-body-lg` | 1.125rem | 18px | 1.5 | Lead paragraphs, emphasis |
| `--text-body-md` | 1rem | 16px | 1.5 | Default body text |
| `--text-body-sm` | 0.875rem | 14px | 1.5 | Secondary text, metadata |

**UI — Interface Elements**

| Token | rem | px | Line-height | Usage |
|---|---|---|---|---|
| `--text-label-lg` | 1rem | 16px | 1.4 | Accessibility-first labels, government default |
| `--text-label` | 0.875rem | 14px | 1.4 | Standard UI density labels |
| `--text-caption` | 0.75rem | 12px | 1.4 | Timestamps, helper text, fine print |
| `--text-overline` | 0.75rem | 12px | 1.4 | All caps — category tags, section labels |

**Tabular — Fixed-width Data**

| Token | rem | px | Line-height | Usage |
|---|---|---|---|---|
| `--text-tabular-lg` | 1.125rem | 18px | 1.6 | Large tabular data, confirmation numbers |
| `--text-tabular-md` | 1rem | 16px | 1.6 | Default data tables, dollar amounts |
| `--text-tabular-sm` | 0.875rem | 14px | 1.6 | Compact tables, reference codes |

> Tabular sizes mirror body sizes (dollar amounts, confirmation numbers appear alongside body text), but use **1.6 line-height** (vs. 1.5 for body) since monospace text benefits from more vertical breathing room in data-dense contexts. Relevant for veteran benefit amounts, claim/reference numbers, etc.

### Font Weights

| Token | Value | Usage |
|---|---|---|
| `--font-weight-regular` | 400 | Default body text weight |
| `--font-weight-medium` | 500 | Semi-emphasis, labels, subheadings |
| `--font-weight-bold` | 700 | Strong emphasis, headings |

No light (300) weight — reduces readability for low-vision users and carries accessibility risk in government UI contexts. Three weights provide sufficient hierarchy. This complements the Ohio brand guideline to **skip a weight** between hierarchy levels for contrast (e.g., regular body → bold heading, not regular → medium).

### Measure (Line Length)

| Token | Value | Usage |
|---|---|---|
| `--text-measure-narrow` | 45ch | Captions, sidebars, constrained layouts |
| `--text-measure-prose` | 65ch | Optimal for running text (Bringhurst 45–75ch) |
| `--text-measure-wide` | 80ch | Code blocks, tables, technical content |

Satisfies the Ohio brand's "line length" readability guidance directly — 65ch is the target measure for body copy.

### Responsive Scaling
Headings scale fluidly between mobile and desktop via `clamp()`. Body text stays fixed — only headings need responsive adjustment.

| Token | Mobile (375px) | Desktop (1440px) | clamp() |
|---|---|---|---|
| `--text-heading-1` | 32px | 40px | `clamp(2rem, 1.5rem + 2vw, 2.5rem)` |
| `--text-heading-2` | 24px | 32px | `clamp(1.5rem, 1.25rem + 1.25vw, 2rem)` |
| `--text-heading-3` | 20px | 24px | `clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)` |

---

## Sources
- `reference/Ohio-Brand_Guide-v1-9.pdf` — Volume 1.9, April 2026 (Color: pp. 21–24, Typography: pp. 25–28)
- MMS Design System Storybook — [Typographic Framework](https://638088.github.io/mms-ds-storybook/?path=/story/foundations-typography--typographic-framework) (type scale, weights, measure, responsive scaling)
