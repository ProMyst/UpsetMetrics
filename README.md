# Upsetmetrics.com — The Bones Build

> A sports publication with an old-money, cross-sport sensibility. Covering unexpected outcomes across tennis, Formula 1, horse racing, equestrian, lacrosse, yachting, polo, golf, and the major American leagues.

This repository contains the **bones build** of Upsetmetrics: the home page, header/navigation, footer, shared design system, full animation infrastructure, and placeholder route files for every section. No landing page — users land directly on the editorial Home. This pass sets the mood and tone for the entire site.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Tech Stack](#tech-stack)
3. [Design Tokens](#design-tokens)
4. [File Structure](#file-structure)
5. [Animation System](#animation-system)
6. [Lenis + GSAP Integration](#lenis--gsap-integration)
7. [Content System](#content-system)
8. [Adding a New Section Page](#adding-a-new-section-page)
9. [Roadmap](#roadmap)
10. [Known Limitations](#known-limitations)
11. [Commands](#commands)
12. [Browser Support](#browser-support)
13. [Performance Budget](#performance-budget)

---

## Design Philosophy

The site should feel like one of these three specific moments:

1. **Highland Park, Dallas — October Saturday morning.** Someone in a cashmere crewneck steps onto a second-story balcony with an espresso and a crisp newspaper, pre-SMU game. Oak leaves, the smell of cut grass, Bermuda rugs, leather chesterfields somewhere behind them.

2. **A yacht in Monaco — the morning of Le Mans.** White linen, bright Mediterranean light, unhurried. The day ahead is important but you are not hurried.

3. **The library at a Connecticut preparatory school.** Dark oak, brass reading lamps, old first editions, the hush of a Sunday afternoon.

**Translated to design:** Ivory paper, deep ink, restrained navy and claret accents, editorial serif typography, generous whitespace, unhurried pacing, and motion that breathes rather than performs.

**The paradox:** Animation is COMPLETELY MAXED OUT, but all of it is slow, elegant, and restrained. Every section scroll-animates. Every heading reveals with split text. Images unveil with clip-path. Numbers count up. Horizontal marquees drift. Parallax everywhere. Custom smooth scroll. Page transitions. But nothing bounces. Nothing is colorful. Nothing is loud. Think the Dior couture show, not a TikTok ad.

**Aesthetic references:** Apple x Notion x Aesop x The New Yorker x Robb Report. Not a sports betting site. Not ESPN. Not a startup landing page. A publication.

---

## Tech Stack

| Technology | Version | Purpose | Why this, not that |
|---|---|---|---|
| **Next.js** | 16.2.4 | App Router, SSR/SSG, file-based routing | Industry standard React framework |
| **React** | 19.2.4 | UI layer | Required by Next.js 16 |
| **TypeScript** | ^5 | Type safety | Non-negotiable for a project this size |
| **Tailwind CSS** | v4 | Utility-first styling via CSS-first `@theme` config | No build-step config file; tokens live in `globals.css` |
| **Motion** | ^12 | Component animations, page transitions, orchestration | Successor to Framer Motion; AnimatePresence, variants |
| **GSAP** | ^3.15 | ScrollTrigger pinning, scrub-based parallax, timeline choreography | Gold standard for scroll-driven animation |
| **Lenis** | ^1.3 | Custom smooth scroll | Lightweight, plays well with GSAP ScrollTrigger |
| **next/font/google** | built-in | Font loading with zero layout shift | Automatic font subsetting and preloading |
| **lucide-react** | ^1.8 | Minimal icon use (only where strictly needed) | Lightweight, tree-shakeable |

### Rejected

- **Radix, shadcn, MUI, Chakra** — No component libraries. Every element is handcrafted.
- **styled-components, emotion** — Tailwind handles all styling.
- **Inter, Roboto, Poppins** — No sans-serifs for body or display. This is an editorial serif site.
- **Framer Motion** — Replaced by its successor, the `motion` package.

---

## Design Tokens

### Colors

All defined as CSS custom properties in `app/globals.css` via Tailwind v4's `@theme inline` block. Use as Tailwind classes: `bg-ivory`, `text-ink`, `border-stone/30`, etc.

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| `--color-ivory` | `#F5F1E8` | `bg-ivory` | Primary background — warm paper |
| `--color-cream` | `#FAF7F0` | `bg-cream` | Lighter variant for layered surfaces, cards |
| `--color-bone` | `#ECE5D3` | `bg-bone` | Subtle divider, card background |
| `--color-ink` | `#141414` | `text-ink` | Primary type — not pure black |
| `--color-graphite` | `#2A2A28` | `text-graphite` | Secondary type |
| `--color-stone` | `#6B6760` | `text-stone` | Tertiary type, meta, timestamps |
| `--color-navy` | `#1B2A3A` | `bg-navy` | Accent, editorial weight |
| `--color-claret` | `#5B1A1A` | `text-claret` | Accent, rare use — mastheads, dropcaps |
| `--color-moss` | `#2F3D2C` | `text-moss` | Accent, equestrian/turf references |
| `--color-brass` | `#A68B5C` | `text-brass` | Gold — dividers, small marks, dropcaps |

**Dominant colors** are ivory and ink. Navy and moss are weight accents. Claret and brass appear sparingly — think of them as a crest on a blazer.

### Typography

Two serifs and one mono. No sans-serifs anywhere except eyebrow microtext.

| Role | Font | Weights | CSS class | Variable |
|---|---|---|---|---|
| **Display** | Fraunces | 300 (large), 400 (smaller) | `text-display-xl`, `text-display-l`, `text-h1`, `text-h2` | `--font-display` |
| **Body** | EB Garamond | 400, 500, italic | `text-body`, `text-small` | `--font-body` |
| **Eyebrow** | Fraunces | 500, uppercase, 0.2em tracking | `text-eyebrow` | `--font-display` |
| **Mono** | JetBrains Mono | 400 | `text-mono` | `--font-mono` |

Fraunces uses the SOFT and opsz variable axes. `font-variation-settings: "SOFT" 100, "opsz" 72` for display sizes.

### Typography Scale (fluid with `clamp()`)

| Level | Size | Line height | Tracking | CSS class |
|---|---|---|---|---|
| Display XL (hero) | `clamp(4rem, 9vw, 9rem)` | 0.95 | -0.02em | `.text-display-xl` |
| Display L | `clamp(3rem, 6vw, 6rem)` | 1.0 | -0.015em | `.text-display-l` |
| H1 | `clamp(2.25rem, 4vw, 3.5rem)` | 1.1 | — | `.text-h1` |
| H2 | `clamp(1.75rem, 2.5vw, 2.25rem)` | 1.2 | �� | `.text-h2` |
| Body | 1.125rem (18px) | 1.7 | — | `.text-body` |
| Small | 0.9375rem (15px) | 1.6 | — | `.text-small` |
| Eyebrow | 0.75rem (12px) | 1.4 | 0.2em, uppercase | `.text-eyebrow` |

### Spacing

| Token | Value | Purpose |
|---|---|---|
| `--gutter` | `clamp(1.5rem, 6vw, 6rem)` | Side margins |
| `--section-pad-y` | `clamp(6rem, 12vw, 12rem)` | Section vertical padding |
| `--content-max` | `68ch` | Max width for reading |
| `--layout-max` | `1440px` | Max layout width |

### Motion Vocabulary

| Property | Value | Notes |
|---|---|---|
| **Silk easing** | `cubic-bezier(0.22, 1, 0.36, 1)` | Used everywhere. Slow-out, feels like silk. |
| **Reveal duration** | 1200ms | Deliberately unhurried |
| **Hero char reveal** | 1400ms, 60ms stagger | Character-by-character for hero only |
| **Default stagger** | 80ms between siblings | |
| **Parallax depth** | 15–25% images, 5–10% text | |
| **Clip-path reveal** | 1400ms, `inset(100% 0 0 0)` → `inset(0)` | Paired with scale(1.08→1) settle |
| **Page exit** | 400ms fade + 20px slide down | |
| **Page enter** | 600ms fade + scale from 1.02 | |
| **Marquee speed** | 120s full loop | CSS animation, pauses on hover |
| **CountUp** | 2500ms, ease-out RAF curve | |
| **Magnetic radius** | 120px, 30% strength | Spring back on mouseleave |
| **No bouncy springs** | — | This is not a playful site. |

### Hero Texture Layers (CSS-only)

The hero section uses three stacked pseudo-element layers for tactile feel:
- Radial vignette at 5% ink, focusing attention on the headline
- SVG turbulence noise at 50% opacity + multiply blend, creating paper grain
- Warm brass gradient top-to-middle at 3.5%, mimicking natural paper lighting

The headline also has a letterpress text-shadow (highlight + soft drop + glow) that gives the feeling of type pressed into paper. No image assets are loaded; the entire effect is two CSS classes: `.hero-section` and `.hero-headline-letterpress` in `globals.css`.

---

## File Structure

```
app/
├── layout.tsx                      # Root layout: fonts, Lenis provider, Header, Footer
├── page.tsx                        # HOME — assembles all home sections
├── globals.css                     # Tailwind v4 @theme tokens, Lenis styles, typography classes
├── tennis/page.tsx                 # Placeholder route
├── f1/page.tsx                     # Placeholder route
├���─ horse-racing/page.tsx           # Placeholder route
├── equestrian/page.tsx             # Placeholder route
├── lacrosse/page.tsx               # Placeholder route
├── yachting/page.tsx               # Placeholder route
├── polo/page.tsx                   # Placeholder route
��── golf/page.tsx                   # Placeholder route
├── american/page.tsx               # NFL/NBA/CFB placeholder
├── newsletter/page.tsx             # Placeholder with sign-up form stub
├── methodology/page.tsx            # Placeholder for "How Upset Score works"
├── archive/page.tsx                # Placeholder for historical archive

components/
├── nav/
│   ├── Header.tsx                  # Sticky header, transparent→frosted on scroll, manages dropdown/mobile state
│   ├── NavLinks.tsx                # Desktop nav with animated underlines, magnetic effect
│   ├── MobileNav.tsx               # Full-viewport ivory overlay with staggered sport reveals
│   └── SportsDropdown.tsx          # Full-width mega-menu with staggered sport names in Fraunces italic
├── footer/
│   └── Footer.tsx                  # Four-column footer: wordmark, sports, site links, credit
├── home/
│   ├── Hero.tsx                    # Masthead hero with orchestrated load-in (chars, eyebrow, rule, scroll indicator)
│   ├── UpsetTicker.tsx             # Horizontal drifting marquee of recent upsets, mono, pause-on-hover
│   ���── FeaturedUpset.tsx           # Large editorial card: parallax image + headline + pull-quote
│   ├── ThisWeekGrid.tsx            # Asymmetric 12-col grid of upset cards with clip-path stagger
│   ├── SportsRotator.tsx           # GSAP ScrollTrigger pinned section cycling sport names
│   ├── UpsetScoreExplainer.tsx     # Two-column newspaper layout with dropcap + CountUp number
│   └── NewsletterBlock.tsx         # Elegant email capture with fade-to-thank-you
├── ui/
│   ├── SplitTextReveal.tsx         # Reusable scroll-triggered split-text animation (chars/words/lines)
│   ├── ParallaxImage.tsx           # Clip-path reveal + scrub parallax, placeholder fallback
│   ├── CountUp.tsx                 # Animated number with IntersectionObserver + RAF ease-out
│   ├── MagneticLink.tsx            # Cursor-following magnetic effect on interactive elements
│   ├── Divider.tsx                 # Brass ✦ mark between hairline rules
│   ├── Eyebrow.tsx                 # Small-caps section kicker
│   └── SectionPlaceholder.tsx      # Reusable "Coming Soon" treatment for placeholder routes
├── motion/
│   ├── SmoothScrollProvider.tsx    # Lenis initialization, GSAP sync, route-change handling
│   ├── PageTransition.tsx          # AnimatePresence fade/slide/scale between routes
│   └── RevealOnScroll.tsx          # Generic GSAP scroll-triggered reveal wrapper

lib/
├── fonts.ts                        # next/font/google config for Fraunces, EB Garamond, JetBrains Mono
├── gsap.ts                         # GSAP + ScrollTrigger registration (client-side only)
└── constants.ts                    # Nav items, sports list, ticker data, easing/duration constants
```

---

## Animation System

### 1. SplitTextReveal (`components/ui/SplitTextReveal.tsx`)

Manually splits text into `<span>` elements (by characters, words, or lines — no GSAP SplitText plugin required). Each piece is wrapped in an overflow-hidden container. On scroll-enter at 80% viewport, GSAP animates each piece from `y: 110%, opacity: 0` to `y: 0, opacity: 1`.

**Usage:**
```tsx
<SplitTextReveal
  text="The Upsets We Will Remember"
  tag="h1"
  className="text-display-xl"
  splitBy="words"    // "chars" | "words" | "lines"
  stagger={0.06}     // seconds between each piece
  delay={0}          // seconds before animation starts
/>
```

**How it works internally:**
```tsx
// 1. Split text into spans
const pieces = splitBy === "chars"
  ? text.split("").map(ch => <span className="inline-block overflow-hidden"><span ref={/*collect refs*/}>{ch}</span></span>)
  : text.split(" ").map(word => /* similar */);

// 2. GSAP ScrollTrigger on mount
useEffect(() => {
  gsap.fromTo(pieceRefs, {
    y: "110%", opacity: 0
  }, {
    y: "0%", opacity: 1,
    duration: 1.2,
    stagger: 0.06,
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    scrollTrigger: {
      trigger: containerRef.current,
      start: "top 80%",
      once: true
    }
  });
}, []);
```

### 2. ParallaxImage (`components/ui/ParallaxImage.tsx`)

Two-part animation: (a) clip-path reveal from bottom on scroll-enter, (b) continuous parallax scrub.

- Outer container: `overflow: hidden`, clip-path animates from `inset(100% 0 0 0)` to `inset(0 0 0 0)` over 1.4s
- Inner image: scales from 1.08 to 1.0 during reveal, then translates Y by `depth%` as user scrolls (scrub: true)
- If no `src` provided, renders a tinted navy placeholder block at 8% opacity

### 3. RevealOnScroll (`components/motion/RevealOnScroll.tsx`)

Generic wrapper. Children animate from opacity 0 + directional offset (up: y 60px, left: x -60px, right: x 60px) to their natural position on scroll-enter at 85% viewport. Duration 1.2s, silk easing.

### 4. CountUp (`components/ui/CountUp.tsx`)

Uses IntersectionObserver to detect when the element enters the viewport, then runs a `requestAnimationFrame` loop with an ease-out curve (`1 - Math.pow(1 - t, 3)`) over 2500ms. Formats numbers with commas. Supports prefix/suffix strings.

### 5. MagneticLink (`components/ui/MagneticLink.tsx`)

On `mousemove` within a 120px radius of the element center, translates the element toward the cursor at 30% strength. Springs back on `mouseleave` using `gsap.to` with 0.6s duration and elastic ease. Automatically disabled on touch devices via `(hover: none)` media query check.

### 6. SportsRotator (`components/home/SportsRotator.tsx`) — The animation showpiece

Uses GSAP ScrollTrigger with `pin: true`. The outer container height is set to `(sports.length + 1) * 100vh`. The inner display container pins to the viewport. As the user scrolls through the tall container, sport names cycle via scrub-based opacity/y animations.

**ScrollTrigger pin pattern:**
```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: `+=${sports.length * 100}%`,
      pin: pinRef.current,
      pinSpacing: false,
    });

    sports.forEach((sport, i) => {
      const el = document.querySelector(`[data-sport="${i}"]`);
      // Fade in
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0,
        scrollTrigger: {
          trigger: containerRef.current,
          start: `${(i / sports.length) * 100}% top`,
          end: `${((i + 0.5) / sports.length) * 100}% top`,
          scrub: true,
        }
      });
      // Fade out
      gsap.fromTo(el, { opacity: 1, y: 0 }, {
        opacity: 0, y: -40,
        scrollTrigger: {
          trigger: containerRef.current,
          start: `${((i + 0.5) / sports.length) * 100}% top`,
          end: `${((i + 1) / sports.length) * 100}% top`,
          scrub: true,
        }
      });
    });
  }, containerRef);

  return () => ctx.revert();
}, []);
```

### 7. Hero Load Orchestration (`components/home/Hero.tsx`)

Uses Motion's `variants` with `staggerChildren` and `delayChildren` for a precisely timed sequence:

- **0ms**: Ivory background visible
- **100ms**: Header fades in (handled by Header component)
- **300ms**: Eyebrow "VOL. I · EST. 2026" fades in with slight y offset
- **500ms**: Headline characters begin revealing (60ms stagger, 1400ms each)
- **+400ms**: Subtitle fades in
- **+200ms**: Brass rule draws left-to-right via `scaleX(0) → scaleX(1)`, origin-left
- **+300ms**: Scroll indicator fades in and begins bobbing

### 8. Marquee Ticker (`components/home/UpsetTicker.tsx`)

Pure CSS animation (`@keyframes marquee` in globals.css, 120s linear infinite). Content is duplicated to create seamless loop. Pauses on hover via `animation-play-state: paused`.

### 9. Clip-path Card Reveals (`components/home/ThisWeekGrid.tsx`)

Cards use `clip-path: inset(100% 0 0 0)` → `inset(0 0 0 0)` with GSAP ScrollTrigger, 800ms each, 80ms stagger between cards. Hover state: subtle scale to 1.01 and border transition from transparent to `--color-stone`.

---

## Lenis + GSAP Integration

This is the most important architectural detail. Lenis hijacks native scroll, which means GSAP's ScrollTrigger can't read scroll position via its default method. The `SmoothScrollProvider` solves this.

### How it works (`components/motion/SmoothScrollProvider.tsx`)

```tsx
// 1. Initialize Lenis
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

// 2. CRITICAL: Sync Lenis → ScrollTrigger on every scroll event
lenis.on("scroll", ScrollTrigger.update);

// 3. Drive Lenis with requestAnimationFrame
function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

### The footgun

If you skip step 2 (`lenis.on("scroll", ScrollTrigger.update)`), ScrollTrigger animations will not fire because Lenis is handling scroll and ScrollTrigger never sees position updates. This single line is the bridge between the two systems.

### Route change handling

On pathname change, the provider:
1. Scrolls Lenis to top immediately: `lenis.scrollTo(0, { immediate: true })`
2. Refreshes all ScrollTrigger instances: `ScrollTrigger.refresh()`

This prevents stale trigger positions after navigation.

---

## Content System

### Current state

All content is hardcoded in React components. There is no CMS, no MDX, no content API. Placeholder copy is written directly into:

- `components/home/Hero.tsx` — headline, subtitle
- `components/home/FeaturedUpset.tsx` — headline, pull-quote, byline
- `components/home/ThisWeekGrid.tsx` — card data array
- `components/home/UpsetScoreExplainer.tsx` — methodology text
- `components/home/NewsletterBlock.tsx` — heading, body
- `lib/constants.ts` — ticker items, sport metadata

### Upgrade path

**Phase 1: MDX** — Move article content to `.mdx` files in a `content/` directory. Use `@next/mdx` or `contentlayer` to parse at build time. Components remain the same; they just read from MDX frontmatter instead of hardcoded strings.

**Phase 2: Headless CMS** — For a multi-author publication, migrate to Sanity, Contentful, or Payload CMS. Create content types for Upsets, Articles, Sports. API routes fetch from CMS; components consume via server components. The design system and animation layer remain untouched.

**Phase 3: Real-time data** — Integrate sports data APIs. Upset Score calculations run server-side; results cached in a database. Frontend consumes via API routes.

---

## Adding a New Section Page

1. **Create the route file:**
   ```tsx
   // app/{slug}/page.tsx
   import SectionPlaceholder from "@/components/ui/SectionPlaceholder";

   export default function NewSportPage() {
     return (
       <SectionPlaceholder
         title="New Sport"
         eyebrow="LEAGUE · TOURNAMENT · SEASON"
         subtitle="Description of what this section will cover."
       />
     );
   }
   ```

2. **Add to constants** in `lib/constants.ts`:
   ```tsx
   // Add to SPORTS array
   { name: "New Sport", slug: "new-sport", description: "Short meta description" },
   ```

3. The sport automatically appears in:
   - Desktop sports dropdown (reads from `SPORTS`)
   - Mobile nav (reads from `SPORTS`)
   - Footer sports links (reads from `SPORTS`)

---

## Roadmap

### Phase 1: Content (next)
- [ ] Wire up real content via MDX or headless CMS
- [ ] Build out individual sport page templates (not just placeholders)
- [ ] Article detail page with full editorial layout
- [ ] Archive page with filtering by sport, date, score range

### Phase 2: Data
- [ ] Integrate data pipelines: `nba_api`, `nfl_data_py`, `cfbd-python`, `balldontlie`
- [ ] Implement Upset Score calculation engine (five signals: betting markets, ranking differential, recent form, venue history, narrative weight)
- [ ] Real-time ticker data from live scores
- [ ] Historical database of scored upsets

### Phase 3: Newsletter & Growth
- [ ] Newsletter signup integration (ConvertKit, Beehiiv, or similar)
- [ ] Email template matching site design
- [ ] Analytics (Plausible preferred over Google Analytics)
- [ ] SEO: structured data, Open Graph images, sitemap

### Phase 4: Polish
- [ ] Real photography / editorial imagery
- [ ] Custom cursor implementation (6px ink dot + 32px trailing ring)
- [ ] Paper-grain texture overlay (extremely subtle)
- [ ] Loading skeleton states matching design system

---

## Known Limitations

This is the **bones build only**. The following are explicitly not included:

- **No real data** — All content is hardcoded placeholder copy
- **No CMS** — Content lives in React components
- **No auth** — No user accounts or login
- **No newsletter backend** — Form submits to client state only; no email service connected
- **No dark mode** — The ivory light theme is the statement; dark mode is not planned for this phase
- **Placeholder images 404** — Image paths reference files that don't exist yet; ParallaxImage falls back to tinted blocks
- **No real Upset Score calculation** — The methodology is described but not implemented
- **No search** — Archive page is a placeholder
- **GSAP SplitText** — We use manual text splitting (not the GSAP paid SplitText plugin). The manual approach handles chars and words well but has no automatic line detection.
- **SEO** — Basic metadata and OG text only; no structured data, Open Graph images, or sitemap yet
- **No focus trap library** — The mobile nav uses manual focus management which may have edge cases

---

## Commands

```bash
# Development server (Turbopack, hot reload)
npm run dev

# Production build
npm run build

# Start production server (after build)
npm run start

# Lint
npm run lint
```

---

## Browser Support

**Target:** Modern evergreen browsers (Chrome, Firefox, Safari, Edge — latest 2 versions).

**Requirements:**
- CSS `clamp()` — supported in all evergreen browsers
- CSS `clip-path: inset()` — supported in all evergreen browsers
- CSS `backdrop-filter` — supported with `-webkit-` prefix in Safari
- IntersectionObserver — supported everywhere
- `requestAnimationFrame` — supported everywhere
- Lenis smooth scroll — requires `wheel` event support; degrades gracefully on older browsers
- GSAP ScrollTrigger — broad support; the Lenis integration is the only complexity

**Mobile:** All animations are present on mobile. MagneticLink disables on touch devices. The mobile navigation is a full-viewport overlay, not a bottom sheet.

---

## Performance Budget

| Metric | Target | Notes |
|---|---|---|
| LCP | < 2.5s | Hero is text-only (no images); fonts preloaded via next/font |
| CLS | < 0.1 | next/font eliminates layout shift from font loading |
| FID | < 100ms | No heavy JS on first interaction |
| Total JS | Monitor | GSAP + Motion + Lenis add ~80KB gzipped; keep an eye on bundle |

**Considerations:**
- The heavy animation load means we need to be surgical about image sizes and font subsetting (handled automatically by `next/font/google`)
- GSAP ScrollTrigger creates many scroll listeners; use `gsap.context()` and clean up on unmount to prevent memory leaks
- Lenis RAF loop runs continuously; this is by design but worth monitoring on low-power devices
- Consider `will-change: transform` on animated elements (already applied where needed)
- Parallax images should be optimized via `next/image` when real photography is added

---

## Credits

- **Design & Development:** Bones build, April 2026
- **Typography:** Fraunces by Undercase Type, EB Garamond by Georg Duffner, JetBrains Mono by JetBrains
- **Animation:** GSAP by GreenSock, Motion (Framer Motion successor), Lenis by Studio Freight

---

## Changelog

### v0.2.1 — Hero Texture + Letterpress (April 2026)

- Added textured paper background to hero section via layered CSS (radial vignette, SVG turbulence noise, warm brass top wash)
- Added letterpress text-shadow effect to hero headline for pressed-into-paper feeling
- Reduced-motion variant of letterpress preserved for accessibility
- No new assets or dependencies — entire effect is CSS-only

### v0.2 — Bug Fixes + Polish (April 2026)

**Bugs fixed:**
- **BUG 1:** UpsetTicker no longer renders literal `\u2726` — replaced with actual `✦` characters
- **BUG 2:** MagneticLink consolidated to single set of event listeners with proper cleanup; refactored from `<a>/<div>` to `<span>` wrapper pattern
- **BUG 3:** Eyebrow component uses static Tailwind class map instead of fragile dynamic `text-${color}` interpolation
- **BUG 4:** SportsRotator background opacity increased from 0.05 to 0.10 with 3-phase timing (30% fade in, 40% hold, 30% fade out)
- **BUG 5:** Added branded `not-found.tsx` (404), `loading.tsx` (with pulsing divider), and `error.tsx` (client error boundary with reset)
- **BUG 6:** Sports dropdown hover reliability improved — 250ms close timeout + 12px invisible bridge element between nav item and dropdown panel

**Polish items:**
- **FIX 7:** Added viewport metadata (themeColor, maximumScale) and OpenGraph/Twitter text metadata
- **FIX 8:** Added `prefers-reduced-motion` support via `usePrefersReducedMotion` hook — Lenis skips initialization, all GSAP animations show instantly, SportsRotator renders stacked instead of pinned
- **FIX 9:** Accessibility improvements — `aria-expanded`/`aria-controls` on hamburger, `role="dialog"`/`aria-modal` on mobile nav, `role="menu"`/`role="menuitem"` on sports dropdown, `aria-hidden` on hero character spans, `focus-visible` styles on nav links and interactive elements, focus management on mobile nav open/close
- **FIX 10:** Visual refinements — hero subtitle uses fluid `clamp()` sizing, header logo shrinks on scroll, footer fourth column has inline email signup, ThisWeekGrid cards have brass arrow on hover, Divider has `aria-orientation`, UpsetTicker font reduced to 11px with 0.15em tracking
- **FIX 11:** ESLint passes with zero errors — fixed unused imports, `<img>` → `next/image`, React ref patterns, `useSyncExternalStore` for reduced motion hook
- **FIX 12:** README updated with changelog and revised known limitations

### v0.1 — Initial Bones Build (April 2026)

- Complete design system: ivory/ink editorial palette, Fraunces + EB Garamond + JetBrains Mono
- Animation infrastructure: Lenis smooth scroll, GSAP ScrollTrigger, Motion page transitions
- UI primitives: SplitTextReveal, ParallaxImage, CountUp, MagneticLink, Divider, Eyebrow
- Navigation: sticky header with frosted glass, sports mega-dropdown, mobile overlay
- Home page: 7 sections (Hero, UpsetTicker, FeaturedUpset, ThisWeekGrid, SportsRotator, UpsetScoreExplainer, NewsletterBlock)
- Footer: four-column editorial layout
- 12 placeholder route pages
- Exhaustive README documentation

---

*Upsetmetrics · A record of the unexpected · Est. MMXXVI*
