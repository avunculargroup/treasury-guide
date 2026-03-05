# Design Brief — Bitcoin Treasury Guide
**Company:** Bitcoin Treasury Solutions (BTS)
**Platform:** Bitcoin Treasury Guide

---

## Brand Essence

Bitcoin Treasury Guide is a premium decision-making platform for Australian CFOs and finance executives navigating corporate bitcoin adoption. The design must communicate that this is a serious, credible tool — not a crypto hype product.

The platform sits at the intersection of **institutional finance** and **modern software**. Think: the rigour of a private wealth manager, delivered with the polish of Stripe or Linear.

---

## Personality

**Primary traits:** Trustworthy, Approachable  
**Secondary traits:** Sophisticated, Calm, Authoritative without being cold

The tone is like a highly competent advisor who speaks plainly. It never oversells, never shouts, and never feels speculative or volatile — even though bitcoin itself can be.

**What it should never feel like:**
- Crypto-native or blockchain-hype aesthetic (no neon, no dark mode by default, no rocket emojis)
- Generic SaaS template (no purple gradients, no Inter everywhere)
- Overly corporate or stiff (no clip-art icons, no stock-photo energy)

---

## Visual Identity

### Colour Palette

| Role | Value | Usage |
|------|-------|-------|
| Background | `#FAFAF8` | Primary page background — warm off-white |
| Surface | `#FFFFFF` | Cards, panels, modals |
| Surface subtle | `#F4F4F1` | Secondary sections, input backgrounds |
| Border | `#E8E6E0` | Dividers, card borders — warm grey |
| Text primary | `#1A1915` | Headings, body — near-black with warmth |
| Text secondary | `#6B6860` | Supporting text, labels, captions |
| Text tertiary | `#9E9C96` | Placeholder text, disabled states |
| Gold accent | `#C9A84C` | Primary accent — CTAs, highlights, icons |
| Gold light | `#F0E4C0` | Accent backgrounds, tags, badges |
| Gold dark | `#9A7A2E` | Hover states, pressed states |
| Success | `#3D7A5E` | Positive signals, completion states |
| Warning | `#B8860B` | Caution states (complements gold) |
| Destructive | `#B04040` | Errors, destructive actions |

**Principle:** The palette is warm, not cold. Avoid pure `#FFFFFF` backgrounds and `#000000` text — always use the warm-tinted versions. Gold should feel like refined accent, not bitcoin-orange branding.

### Typography

**Display / Headings:** `Playfair Display` — serif, editorial, authoritative. Used for hero headings, section titles, and any large typographic moments.

**Body / UI:** `DM Sans` — clean, geometric sans-serif. Readable, modern, not startup-generic. Used for body copy, labels, navigation, buttons.

**Monospace (data):** `JetBrains Mono` — for any numerical data, percentages, bitcoin amounts, or code-like elements.

**Scale (base 16px):**
- Display: 48–64px, Playfair Display, weight 700
- H1: 36px, Playfair Display, weight 600
- H2: 28px, Playfair Display, weight 600
- H3: 20px, DM Sans, weight 600
- H4: 16px, DM Sans, weight 600
- Body: 16px, DM Sans, weight 400, line-height 1.6
- Small: 14px, DM Sans, weight 400
- Caption: 12px, DM Sans, weight 500, letter-spacing 0.04em uppercase

**Principle:** Headings use the serif for gravitas. Body stays in the sans for clarity. Never mix two serifs or two sans-serifs.

### Spacing & Layout

- Base unit: `4px`
- Standard section padding: `80px` vertical on desktop, `48px` on mobile
- Card padding: `24px`
- Generous whitespace is a feature — don't fill every gap
- Max content width: `1200px`, centred

### Border Radius

**Subtle radius (balanced):**
- Cards, modals, large containers: `12px`
- Buttons: `8px`
- Inputs, small elements: `6px`
- Badges, tags: `4px`
- Avoid fully circular buttons or pill shapes unless used for tags only

### Shadows

Warm, soft shadows — not cool grey:
```css
--shadow-sm: 0 1px 3px rgba(26, 25, 21, 0.06), 0 1px 2px rgba(26, 25, 21, 0.04);
--shadow-md: 0 4px 12px rgba(26, 25, 21, 0.08), 0 2px 4px rgba(26, 25, 21, 0.04);
--shadow-lg: 0 12px 32px rgba(26, 25, 21, 0.10), 0 4px 8px rgba(26, 25, 21, 0.06);
```

---

## Components

### Buttons

- **Primary:** Gold background (`#C9A84C`), near-black text (`#1A1915`), 8px radius. On hover: `#9A7A2E`.
- **Secondary:** White background, `#E8E6E0` border, near-black text. On hover: `#F4F4F1` background.
- **Ghost:** Transparent, near-black text. On hover: `#F4F4F1` background.
- **Destructive:** `#B04040` background, white text.
- All buttons: `DM Sans`, weight 500, 14–15px, adequate horizontal padding (`20–24px`).

### Cards

- White background, `#E8E6E0` border (1px), `12px` radius, `--shadow-sm`
- On hover (if interactive): `--shadow-md`, subtle lift
- Avoid heavy card shadows by default — lightness is the aesthetic

### Navigation

- Light background, not dark
- Logo: "Bitcoin Treasury Guide" wordmark — Playfair Display for "Bitcoin Treasury", DM Sans for "Guide" or "by BTS"
- Clean horizontal nav on desktop, subtle bottom border separator
- Active state: gold underline or gold text

### Data & Charts

- Chart accent colours lead with gold (`#C9A84C`), secondary with `#3D7A5E`
- Axes and grid lines: `#E8E6E0` (warm grey, not cold)
- Numbers and data values: `JetBrains Mono`
- Avoid overly colourful charts — restrained palette reads as more trustworthy

### Forms & Inputs

- Border: `#E8E6E0`, radius `6px`, background `#FFFFFF`
- Focus: gold border (`#C9A84C`), subtle gold glow `rgba(201, 168, 76, 0.15)`
- Labels: DM Sans, 14px, weight 500, `#1A1915`

### Progress & Steps

- The guided wizard flow (Learn → Decide → Plan → Track) should have clear, elegant step indicators
- Active step: gold accent
- Completed step: success green (`#3D7A5E`) with checkmark
- Step labels in DM Sans, 13px

---

## Motion & Interaction

- Keep animations subtle and purposeful — this is a serious tool, not an entertainment product
- Page transitions: simple fade (150ms ease)
- Card hover: `transform: translateY(-2px)`, shadow increase (200ms ease)
- Button interactions: 100ms ease, slight scale on press (`scale(0.98)`)
- No bouncy or elastic animations
- Loading states: skeleton screens in `#F4F4F1`, not spinners where possible

---

## Imagery & Icons

- **Icons:** Lucide icons (already in the stack) — use `stroke-width: 1.5` for a refined feel, not the default heavy weight
- **No stock photos** of bitcoin coins, physical gold, or generic finance imagery
- If illustrative elements are needed: simple, geometric line illustrations in the gold/warm palette
- Australian regulatory context can be subtly referenced through copy, not imagery

---

## Voice & Microcopy (design-adjacent)

- Plain, confident language. No jargon unless necessary, and explain it when used.
- No exclamation marks in UI copy
- Action labels should be specific: "Review allocation strategy" not "Continue"
- Empty states should be helpful, not cutesy

---

## Design Tokens (CSS Variables)

Implement these as a single source of truth in your theme file:

```css
:root {
  /* Colours */
  --color-bg: #FAFAF8;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F4F4F1;
  --color-border: #E8E6E0;
  --color-text-primary: #1A1915;
  --color-text-secondary: #6B6860;
  --color-text-tertiary: #9E9C96;
  --color-gold: #C9A84C;
  --color-gold-light: #F0E4C0;
  --color-gold-dark: #9A7A2E;
  --color-success: #3D7A5E;
  --color-warning: #B8860B;
  --color-destructive: #B04040;

  /* Typography */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(26, 25, 21, 0.06), 0 1px 2px rgba(26, 25, 21, 0.04);
  --shadow-md: 0 4px 12px rgba(26, 25, 21, 0.08), 0 2px 4px rgba(26, 25, 21, 0.04);
  --shadow-lg: 0 12px 32px rgba(26, 25, 21, 0.10), 0 4px 8px rgba(26, 25, 21, 0.06);
}
```

---

## What Good Looks Like

A well-executed screen in this design system should feel like:
- Opening a well-designed annual report from a premium asset manager
- Clean enough to focus on the content
- Warm enough to not feel cold or intimidating
- Gold accents used sparingly — they should feel earned, not sprayed

When in doubt: more whitespace, less colour, let the typography do the work.

---

## How to Use This Brief with Claude Code

1. **Always read this file before making any UI changes**
2. **Implement design tokens first** — create or update your theme/tokens file before touching components
3. **Audit existing components against this brief** — identify gaps before refactoring
4. **Change one component at a time** — nav first, then cards, then forms, etc.
5. **Check each change against the personality traits** — does this feel trustworthy and approachable?
