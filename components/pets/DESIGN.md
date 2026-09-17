---
name: Светлый — питомцы
description: Scoped record of the implemented pet catalog and pet detail visual system.
colors:
  paper: "#f4f1eb"
  warm-paper: "#ece3d2"
  amber: "#f59e0b"
  ink: "#24231f"
  muted-ink: "#625d54"
  prose-ink: "#4e493f"
  accent-ink: "#8c580e"
  profile-button: "#fffcf5"
  profile-rule: "#d5cab8"
  profile-meeting: "#f5a008"
  profile-seeking-bg: "#fff9e9"
  profile-seeking-ink: "#785015"
  profile-home-bg: "#e9efdf"
  profile-home-ink: "#3b552e"
  profile-favorite: "#993253"
  catalog-card: "#ffffff"
  catalog-action: "#2e2620"
typography:
  profile-display:
    fontFamily: "var(--font-playfair), Georgia, serif"
    fontSize: "clamp(58px,6.2vw,88px)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  profile-headline:
    fontFamily: "var(--font-golos), sans-serif"
    fontSize: "clamp(38px,4.2vw,64px)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  profile-headline-accent:
    fontFamily: "var(--font-playfair), Georgia, serif"
    fontWeight: 400
    letterSpacing: "-0.04em"
  profile-body:
    fontFamily: "var(--font-golos), sans-serif"
    fontSize: "18px"
    lineHeight: 1.75
  profile-label:
    fontFamily: "var(--font-golos), sans-serif"
    fontSize: "13px"
  catalog-pet-name:
    fontFamily: "var(--font-playfair), serif"
    fontSize: "clamp(1.9rem,2.5vw,2.6rem)"
    lineHeight: 1.25
rounded:
  pill: "999px"
  profile-button: "40px"
  profile-status: "30px"
  profile-portrait: "26px"
  profile-portrait-compact: "22px"
  profile-related-photo: "24px"
  profile-thumbnail: "12px"
  catalog-card: "30px"
spacing:
  profile-section: "80px"
  profile-section-mobile: "48px"
  catalog-section: "72px"
  catalog-section-mobile: "48px"
  catalog-content-gap: "24px"
  catalog-content-gap-mobile: "20px"
components:
  profile-button:
    backgroundColor: "{colors.profile-button}"
    textColor: "{colors.ink}"
    rounded: "{rounded.profile-button}"
    padding: "14px 23px"
  catalog-button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.catalog-card}"
    rounded: "{rounded.pill}"
    padding: "15px 24px"
  profile-seeking-status:
    backgroundColor: "{colors.profile-seeking-bg}"
    textColor: "{colors.profile-seeking-ink}"
    rounded: "{rounded.profile-status}"
    padding: "8px 14px"
  profile-home-status:
    backgroundColor: "{colors.profile-home-bg}"
    textColor: "{colors.profile-home-ink}"
    rounded: "{rounded.profile-status}"
    padding: "8px 14px"
  catalog-card:
    backgroundColor: "{colors.catalog-card}"
    rounded: "{rounded.catalog-card}"
---

# Design System: Светлый — питомцы

## Overview

**Creative North Star: "Реальный портрет и честная анкета"**

This is a scoped implementation record for `/pets` and `/pets/[id]`, dated 2026-09-17. It carries the user's pinned warm paper, amber, Golos Text, Playfair Display, and real animal photography into both surfaces. It does not establish or replace the site's global identity. The detail page's portrait spread is a surface composition, not a requirement for every page.

The catalog introduces many animals through a photographic collage and rounded photo cards. Following the owner's feedback, the detail page uses a rectangular, unframed Swiper gallery, a Playfair name, colored species/gender/age/size badges, and icon-led fact tiles. The arched gallery and ruled, table-like facts were explicitly rejected. Keep the rich detail and soft surfaces of the catalog rather than reducing the page to a sparse editorial template.

Authority: the approved direction is recorded in `docs/pet-detail-direction-2026-09-17.md` at the outer workspace root. Broader identity context is in `docs/04-design-identity.md`. Tokens here were extracted from `pets.css`, `pets-hero.css`, and `pet-profile.css`; font bindings are in `app/layout.tsx`. There is no root `PRODUCT.md` to supersede these sources.

**Key Characteristics:**
- Warm paper and amber fields with dark, readable type.
- Real shelter photography carries the identity of each animal.
- Golos for interface text; Playfair for animal names and selective emphasis.
- Consistent section rhythm within each surface and breakpoint.
- Quiet, reversible interactions that respect reduced motion.

## Colors

### Primary

Amber carries the catalog's emphasis and support section. The detail contact section uses its implemented `profile-meeting` variation. Accent ink is the deeper amber-brown used for detail heading emphasis and links. These differences are recorded as existing values, not a newly standardized site palette.

### Secondary

Home-status green distinguishes an animal already at home. Favorite rose indicates saved state. These are semantic states, not competing decorative accents; both also have explicit labels or pressed state.

### Neutral

Paper is the page ground and detail opening spread; warm paper is the catalog cover and personal support section. Ink supports names and interface text, muted ink supports labels, and prose ink supports longer detail text.

## Typography

**Display and Body Font:** Golos Text, through `--font-golos`, with sans-serif fallback.

**Accent Font:** Playfair Display, through `--font-playfair`; detail accents use Georgia and serif fallbacks.

Detail and catalog names use Playfair. Golos carries interface text; detail section headings use italic Playfair on the emphasized phrase. Interface labels use sentence case.

The frontmatter records desktop detail roles. At widths up to 1100px the detail name is 64px; up to 767px it uses `clamp(52px,12vw,76px)`. The main name is capped at 88px on large screens. The existing catalog cover has its own type scale and tracking; do not silently normalize that neighboring surface during detail work.

Detail lead text is limited to 48ch and story prose to 60ch. Story text reduces to 17px at the intermediate breakpoint and 16px on mobile. Known CMS text keeps paragraph breaks and wraps long words rather than widening the layout.

## Layout

The catalog uses a 1400px maximum content width with 48px desktop side gutters, 32px gutters up to 1100px, and 20px gutters up to 700px. Its grid moves from three columns to two up to 999px and one up to 599px. On mobile the filters become a disclosure below the search and status controls.

The detail uses a 1360px maximum content width with the same desktop and intermediate gutters, then 20px gutters up to 767px. Its opening desktop grid is `1.1fr 1fr`: portrait at left, name and profile at right. At 1100px and below the entire opening follows one reading column: breadcrumb, name/status/badges, portrait, summary/actions/facts. Never squeeze the gallery and summary into adjacent columns on a tablet. Fact tiles retain two columns on mobile.

The duplicate story collage is removed; extra factual CMS copy stays beside the main profile in a disclosure. The meeting section groups the paper envelope, heading and action above three compact steps, which stack on phones. Personal support uses a 1120px composition with paper care decor beside the compact form; at 1100px and below the form follows the introduction. Related animals use three columns, two up to 767px, and one up to 599px. Section padding is equal above and below within each breakpoint.

## Elevation & Depth

The main detail spread is flat and open. Speckled paper, warm color fields, borders, and photography establish depth. Small shadows make controls tangible; they do not create a stack of containers around the animal's story. Catalog cards retain their existing soft shadow and hover lift. Exact shadow, motion, focus, and breakpoint extensions live in the scoped `.impeccable/design.json` sidecar.

## Shapes

The profile name has the homepage’s shallow, slightly tilted amber underline (#f59e0b), sized to the text rather than the column. Preserve its Playfair font and heading semantics.

The detail portrait is a direct rectangular photo with 26px corners and no outer frame, padding, or panel shadow. The desktop image is 4:4.6, tablet 4:3 with 24px corners, phone 4:4.3 with 22px corners. The full-photo viewer uses `object-fit: contain`. Never restore the rejected arch or white outer frame. Related photos use rounded rectangles within white cards.

Actions and status labels use pills; gallery controls have 44px targets. Status and favorite stay together in a wrapping row. Facts use compact white tiles; the care note uses a pale amber surface. Known character ratings have full-width tracks in amber, rose and sage, with explicit numeric values so meaning does not rely on color.

## Components

### Buttons and saved state

The main meeting action uses the catalog's dark pill with an amber heart; support uses amber. Other detail actions retain the light variant. Minimum height is 52px on desktop and 50px on mobile; widths fit their labels. Hover lifts by 2px, keyboard focus has a visible 3px outline, and pressed feedback does not change layout. The favorite pill sits beside status, becoming icon-only below 360px while retaining its accessible name. It shares the catalog's saved-animal store.

Catalog actions retain dark pills, amber hover/focus treatment, and their existing light variant on amber sections. Do not replace them merely to make every surface's button color identical.

### Search, filters, and status

The catalog search is a white pill containing its amber submit action. Native select controls sit within rounded bordered shells. Status uses two explicit pressed buttons. Mobile filters open on request. Status, saved state, loading, and no-results feedback must remain understandable through labels and semantics, not color alone.

### Profile facts and story

Facts remain a semantic definition list, presented as compact white tiles with clear amber icon blocks. Age and size are badges beside species and gender; known temperament ratings sit near the other facts. Only known optional facts appear. Unknown age is handled explicitly; absent ratings are omitted from detail. Treatment is a care note only when explicitly true. Private `comment` is not published. Do not restore the removed standalone story/photo collage. Additional real CMS biography, character and health details are available in the profile disclosure only when supplied.

### Gallery

The portrait advances only through visitor actions: previous/next buttons, thumbnails, arrow keys, or a horizontal swipe. Thumbnails show pressed state and scroll the selected image into view. Both main and fullscreen galleries use Swiper. A native modal dialog shows the whole photo on warm translucent paper, with Framer Motion entry (300ms) and exit (180ms). Keep the modal open and focused until exit finishes; Escape, close and focus return must work. There is no autoplay. Failed image loading falls back to an available CMS rendition and then an honest unavailable-photo state; failed thumbnails show their number.

### Contact and related animals

The amber contact section uses the existing VK contact destination and three plain meeting steps. For an animal already home, the contact section is omitted and the main action leads to the catalog. Related animals keep captions outside the photos and are omitted when their separate request yields no usable results.

### Personal support

Every profile includes a smooth-scroll help action and a warm-paper support section before the meeting section. The existing donation controls are reused inside one light form surface. Pet name and document ID are fixed as the donation target; the visitor cannot clear them or replace them through a global campaign intent. A key resets form state when the animal changes. Preset/custom amounts and once/monthly cadence work locally; payments remain disabled by the owner's decision. Do not invent a funding goal, raised total, payment success, or claim funds have been sent. An animal already home has an explicit note to check its current needs with the shelter. Keep the unavailable-payment label visible at every width. Below the form, current active campaigns and public donors are filtered by pet document ID; donor gifts through that pet’s campaigns are included. Empty and unavailable states remain distinct. Styles and animated form transitions are scoped to pet support so campaign and homepage forms retain their layouts.

### Loading, missing, and error states

Loading preserves the portrait/profile layout with paper-colored skeleton shapes and a status announcement. The missing page offers a return to the catalog; the error page offers retry and catalog navigation. Both retain the detail palette and typography. Skeleton animation, photo fades, and transitions stop under reduced motion.

Smooth anchors are provided by the existing global scroll setup; reduced-motion users receive native, immediate scrolling. The full-photo dialog is excluded from Lenis handling. Form identity fields expand/collapse in 280ms; cadence uses a shared Framer Motion highlight. Reduced-motion preferences update during the visit. These are implementation behaviors; preserve them when adjusting visual details.

## Do's and Don'ts

### Do:
- **Do** preserve the pinned paper, amber, Golos, Playfair, and real-photo identity.
- **Do** keep animal captions readable and long factual content able to wrap.
- **Do** keep detail section spacing consistent within each breakpoint.
- **Do** retain keyboard focus, pressed states, explicit labels, and reduced-motion behavior.
- **Do** validate missing data, missing images, home status, and narrow screens alongside the complete profile.

### Don't:
- **Don't** turn the detail composition into a replacement identity for the whole site.
- **Don't** invent animal facts, ratings, vaccination status, or biography to fill the layout.
- **Don't** reintroduce an arched gallery, ruled table-like facts, or remove the catalog-style badges and icons.
- **Don't** add autoplay, hide the full-photo option, or reintroduce removed detail eyebrow labels.
- **Don't** claim this documentation itself establishes browser or accessibility test coverage.

Evidence boundary: the owner approved the preceding visual direction, retaining it except for the duplicate story section. Current browser evidence is `tmp/pet-profile-motion/report.json`: seven widths (320–2560px), Swiper controls/swipe, modal exit and focus return, animated form height, live reduced-motion changes, and zero page errors. Axe main-content checks cover 320/390/1440. Screenshots were visually reviewed. See `docs/pet-profile-motion-2026-09-17.md` for final build and isolated state-test evidence.

### Footer continuity

Rounded corners must reveal the same paper as the preceding section and the page root, including the scrollbar gutter. Do not mask a contrasting backing strip with arbitrary overlap. Verify the junction at mobile, tablet and desktop, including the route without related pets. This rule is also recorded in frontend `AGENTS.md`.
