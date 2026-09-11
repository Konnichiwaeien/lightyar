# Homepage Media Integration Design

**Date:** 30 August 2026  
**Status:** Implemented, partially superseded 31 August 2026  
**Scope:** Integrate the six installed homepage masters that are not yet rendered.

## Current-state amendment — 31 August 2026

The user explicitly removed the three-photo About strip after reviewing the
rendered page. The `moment-1.jpg`, `moment-2.jpg`, and `moment-3.jpg` masters may
remain installed, but they must not be rendered on the homepage. The About
section now has one documentary panorama with a 3:2 container. The triptych
design, triptych verification clauses, and triptych implementation steps below
are retained only as decision history and are not current requirements.

The authoritative responsive contract is
`2026-08-31-homepage-responsive-feedback-design.md`.

## Context

The original production brief delivered 19 homepage assets. The 12 wishlist
objects and `about/panorama.jpg` now have runtime consumers. These six files are
installed but still unused:

- `/about/moment-1.jpg`
- `/about/moment-2.jpg`
- `/about/moment-3.jpg`
- `/donate/companion.jpg`
- `/volunteer/walk.jpg`
- `/texture/paper-grain.png`

The current homepage has evolved since the art brief was written. `AboutSection`
now uses real pet cutouts for its three metrics, `RescuedRing` follows it, and
`PaymentSection` can show a live donation feed beside the form. Integration must
therefore preserve the present information architecture instead of reproducing
the old placeholder layout literally.

## Goals

- Put all six installed masters into meaningful production use.
- Preserve the current section order, copy, CMS data flow and form behavior.
- Extend the existing warm editorial/documentary direction without introducing
  dashboard cards, a second visual language or a new animation system.
- Keep every section readable from 320 px through large desktop and when motion
  is reduced.
- Reserve media geometry before loading and lazy-load every new below-the-fold
  photograph.

## Non-goals

- No new CMS fields or Strapi migrations.
- No changes to payment submission behavior or the live-donation data model.
- No new generated images, copywriting campaign or page reordering.
- No replacement of the accepted `RescuedRing` composition.
- No JavaScript carousel, parallax layer or new motion dependency.

## Approaches considered

### A. Literal reconstruction of the old art brief

Place `moment-*` beside the three metrics and put the companion portrait in the
right half of the existing donation card.

**Rejected:** the metric slots are now intentionally occupied by real pet
cutouts, while the donation card's right half is used by the live feed. Literal
placement would remove newer approved work or make the form too narrow.

### B. Use every image only as a decorative background

This is easy to implement and creates no new document flow.

**Rejected:** the three quiet care scenes and the companion portrait contain
meaning. Cropping all of them behind text would hide their documentary role and
reduce the page to a sequence of background banners.

### C. Editorial continuation inside the existing sections

Add a silent documentary triptych after the About panorama, give the donation
card a dedicated media rail, replace the volunteer placeholder with its intended
full-bleed scene, and replace the temporary generated noise with the final tile.

**Selected:** it keeps every newer component, uses the files according to their
art contracts, and makes each photograph serve a different narrative job.

## Detailed design

### 1. About documentary triptych

Add a semantic list of three figures immediately after the existing panoramic
image inside `AboutSection`.

- At 768 px and wider: a three-column editorial strip. The middle image sits lower and the
  third slightly higher, creating one continuous photographic rhythm rather
  than three equal cards.
- At less than 768 px: use normal vertical document flow. Each figure is
  `min(84%, 24rem)` wide and alternates alignment left/right. There is no
  carousel and no horizontal page overflow.
- All images keep their 4:5 aspect ratio. Cropping may use `object-fit: cover`,
  but faces, hands and the leash connection must remain visible.
- Visible captions are not added. The Russian alternatives are, in order:
  `«Волонтёр расчёсывает собаку»`, `«Кошка отдыхает на тёплом пледе»` and
  `«Собака смотрит на волонтёра перед прогулкой»`. The list structure supplies
  grouping without inventing visible copy.
- A small amber rule and restrained vertical offsets are the only new graphic
  treatment. The photographs must not look like bordered UI cards.

### 2. Donation companion media rail

Keep the existing unified white donation card and insert a dark portrait rail
as its first desktop column.

- At 1280 px and wider, media rail, form and optional live feed share the same
  outer rounded card. With a feed the columns are 24% / 47% / 29%; without a
  feed they are 30% / 70%.
- From 640 through 1279 px, the portrait becomes a wide 16:9 header inside the
  card, then the current form/feed layout continues below it.
- Below 640 px, use a restrained 4:3 crop above the form. The dog's eyes remain
  in the upper central third; the image never sits behind form controls.
- Use a real `<Image>` element with alternative text `«Собака под опекой фонда
  ждёт помощи»`, not a CSS background, so dimensions, responsive
  `sizes`, lazy loading and alternative text are explicit.
- Do not add text over the face and do not alter payment validation or fields.

### 3. Volunteer full-bleed scene

Replace the current brown gradient placeholder with `/volunteer/walk.jpg`.

- Render the image as an absolutely positioned Next image with `fill` and
  `sizes="100vw"`.
- Preserve the existing heading, paragraph and mail link.
- Add a layered neutral-to-dark gradient that is strongest behind the text and
  at the lower edge. Contrast must not depend on the photograph alone.
- Keep the person and both dogs visible using `object-position: 50% 54%` at
  desktop and `50% 50%` below 768 px.
- The photograph is decorative in this section because the adjacent text fully
  communicates the call to action; use an empty `alt`.

### 4. Paper texture

Replace the temporary inline SVG turbulence used by `.film-grain` with
`/texture/paper-grain.png`.

- Keep the existing fixed, pointer-transparent grain layer.
- Tile the 512 px source without scaling it into a visible oversized pattern.
- Start at 4% opacity as specified by the art brief and verify on both the light
  and dark zones. Reduce only if browser screenshots show crushed text or dirty
  image highlights.
- Do not animate the texture. In forced-colors mode it may disappear without
  affecting meaning.

## Component boundaries

- Keep data fetching in `app/page.tsx` unchanged.
- Keep `AboutSection`, `PaymentSection` and `VolunteerSection` as their existing
  client boundaries.
- Extract `AboutMoments` only if the JSX would otherwise obscure the existing
  metric and panorama hierarchy. It accepts no data and owns only the three
  local asset descriptors.
- Prefer component-scoped classes for the new layouts. The global stylesheet is
  changed only for the existing `.film-grain` rule.

## Performance and loading

- Use `next/image` for all five new JPEG consumers.
- All new photographs are below the fold and remain lazy-loaded.
- Every media wrapper has an explicit `aspect-ratio`, preventing layout shift.
- Provide accurate `sizes` values; do not mark these images as high priority.
- Add no new client-side scroll handlers or recurring timers.

## Accessibility

- Documentary About images have meaningful Russian alternative text.
- The volunteer background uses an empty alternative because it repeats the CTA
  context.
- The donation portrait has descriptive alternative text but no text overlay.
- Existing heading order, form labels, focus behavior and links remain intact.
- New layout must remain linear and readable with CSS or motion disabled.

## Verification contract

### Static tests

- Assert that all six local paths have a runtime consumer.
- Assert that About exposes a semantic grouped triptych.
- Assert that the donation and volunteer photos use Next Image with explicit
  responsive sizes.
- Assert that `.film-grain` uses the installed PNG and no longer embeds SVG
  turbulence.

### Browser acceptance

Check 320, 390, 768, 1440 and 1920 px in installed Chrome:

- no page-level horizontal overflow;
- all six local assets return 200;
- About figures preserve their aspect ratio and do not overlap neighboring copy;
- form controls remain fully visible and the live feed is not clipped;
- volunteer heading and CTA remain legible over the photograph;
- no hydration or local runtime errors;
- reduced-motion output contains the same content;
- capture full-section screenshots of About, donation and volunteer at desktop
  and mobile widths for visual review.

## Implementation order

1. Add failing static structure tests for all six consumers.
2. Implement the About triptych and verify its standalone geometry.
3. Implement the donation media rail without changing form behavior.
4. Replace the volunteer placeholder and the temporary grain.
5. Run unit/static tests, targeted lint and TypeScript/build compilation.
6. Run the full browser matrix, inspect screenshots and tune only measured crop
   or overflow defects.
