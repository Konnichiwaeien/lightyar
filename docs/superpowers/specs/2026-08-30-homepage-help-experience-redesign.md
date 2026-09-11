# Homepage Help Experience Redesign

**Date:** 30 August 2026  
**Status:** Approved for implementation by the user (`Серкан`, mechanism A, component split)  
**Scope:** Donation experience, donation feed resilience, volunteer section, and the desktop geometry of `RescuedRing`.

## Authority and relationship to existing documents

This document extends the current homepage architecture in `docs/01-overview.md`,
`docs/02-architecture.md`, `docs/03-component-inventory.md`,
`docs/04-design-identity.md`, `docs/asset-brief-home.md`, and `docs/effects.md`.

It supersedes only these parts of
`docs/superpowers/specs/2026-08-30-homepage-media-integration-design.md`:

- the donation portrait rail is replaced by an interactive real-pet scene;
- the generic centred volunteer overlay is replaced by an editorial action scene.

The donation composition follows the established club contracts rather than a
new editorial experiment: amount cards and the reacting animal are based on
`club-fastpaw/tiers.php` + `sections/tiers.css` + `sections/join.css`; the
compact, honest checkout treatment is aligned with `club-nine-lives/checkout.php`.

The installed `donate/companion.jpg` remains a valid source asset but is not the
hero of the new form. As of 31 August, the user removed the About triptych in
favour of one taller panorama and requested a working compact mobile
`RescuedRing`; paper texture, CMS data flow, and section order remain unchanged.

## Fixed constraints

- CloudPayments is deliberately out of scope. This is already recorded as a
  customer-deferred feature in `docs/03-component-inventory.md`.
- Remove the simulated `setTimeout`/`alert` payment success. The interface must
  never claim that a payment was accepted.
- Current CMS donation rows are test data. The UI calls them recent entries, not
  live verified bank transactions.
- Do not add a Strapi schema or new CMS fields.
- Use a real `Светлый` animal. The chosen hero is **Серкан**. Generated assets
  may alter expression and pose only; coat, markings, proportions, and identity
  must remain recognisable.
- Preserve the dirty mixed worktree. Do not reset, clean, or rewrite unrelated
  files, and do not commit without a separate request.

## Current-state amendment — 31 August 2026, second visual review

The user selected the Fastpaw `join__form` warm-blank composition directly and
rejected the split yellow pet column. The Lightyar implementation keeps its own
amber, ink and paper tokens, but follows the reference structure: editorial vow,
integrated animal, rule-like form heading, tier cards as controls, cadence,
custom amount and one honest disabled provider action. The earlier decision to
hide contact fields before a provider existed is superseded by the third visual
review below.

The earlier always-visible feed panel is superseded. `DonationFeed` remains
mounted and keeps its ready/empty/unavailable data contract, but is presented in
the second panel of an accessible `Помочь` / `Помощники` tab control,
following the campaign `Статистика` / `Герои` pattern. No fabricated donation
data, simulated payment, modal checkout or provider integration is introduced.

## Donation interaction

### State model

The form has one explicit state object:

```ts
type DonationDraft = {
  cadence: "monthly" | "once";
  amount: number;
  tierId: "food" | "care" | "diagnostics" | "treatment";
  donorName: string;
  email: string;
  anonymous: boolean;
  consent: boolean;
};
```

Tier configuration is immutable and kept outside React:

| Tier | Amount | Concrete-help copy | Serkan state |
|---|---:|---|---|
| `food` | 300 ₽ | корм | worried |
| `care` | 500 ₽ | обработка и базовые лекарства | cautious |
| `diagnostics` | 1,000 ₽ | осмотр и анализы | relieved |
| `treatment` | 3,000 ₽ | вклад в этап лечения | trusting |

These are editable project values, not guaranteed veterinary prices. Copy uses
the formulation “помогает с…” rather than “полностью оплачивает…”. A custom
amount maps to the greatest tier threshold not exceeding the value; invalid or
sub-300 input uses the first state without inventing a fifth mood.

The monthly/one-time control remains, with monthly selected by default. Name is
optional. Email remains labelled as the future receipt address. Controls remain
interactive so the experience can be reviewed, but the final action is a
disabled button with visible explanatory copy:
“Онлайн-оплата подключается”. It does not submit, validate, write data, open a
modal, or display success.

### Component boundaries

- `components/donations/donation-experience.tsx` — the only client state owner;
- `components/donations/donation-pet.tsx` — renders mood assets and restrained
  crossfades;
- `components/donations/donation-tier-picker.tsx` — semantic amount radio group;
- `components/donations/donation-fields.tsx` — cadence, custom amount, optional
  donor identity, and provider-unavailable action;
- `components/donations/donation-feed.tsx` — always-present recent-help region;
- `lib/donations/donation-tiers.ts` — tier configuration and public types;
- `lib/donations/get-donation-tier.ts` — pure amount-to-tier mapping;
- `components/sections/payment-section.tsx` — section heading and composition
  only; it passes server-provided feed data into `DonationExperience`.

No component except `DonationExperience` may coordinate unrelated state.
Mapping logic is unit-tested without React.

### Serkan asset contract

Create four transparent WebP masters under `public/donate/serkan/`:

- `worried.webp` — lowered posture, cautious gaze, no exaggerated suffering;
- `cautious.webp` — attentive, still uncertain;
- `relieved.webp` — body visibly relaxed, soft gaze;
- `trusting.webp` — calm contact and open posture, not a human-like grin.

All four use the same canvas, baseline, scale, lighting direction, and identity.
Every master is inspected at full resolution, against light and saturated dark
backgrounds, for alpha halos and clipped fur. The first meaningful paint uses
`worried.webp`; the remaining states lazy-load, while the layout reserves the
full scene size and does not jump.

### Composition

At desktop widths the contribution UI is one compact warm club panel: the form
occupies the wider left column and the aligned Serkan cutout occupies the right.
The four amount cards are the amount control itself and use a 2×2 layout; a
second duplicate amount row is forbidden. Selected state is communicated by
border, marker, copy, and pet mood—not colour alone.

The donation feed occupies a dedicated tab beside the contribution tab. At
desktop widths Serkan is integrated into the right edge of the warm paper form.
On mobile the cutout enters from the upper-right of the same form while the vow
reserves its space. Below 768 px the amount cards become a horizontal snap strip,
matching the Fastpaw club pattern; cadence, custom amount and provider status
follow. Tap targets remain at least 48 px and inputs use at least 1rem text.

Motion is limited to a 220–300 ms opacity/transform crossfade between already
aligned mood assets. `prefers-reduced-motion` switches instantly while keeping
the same content.

### Control and helper-feed polish (2026-08-31)

Serkan remains the responsive mood illustration in the form. The redundant
`Серкан` / mood-status caption and the medical-cross decoration are removed;
the animal itself must not be removed. The two primary tabs use meaningful
icons and are named `Помочь` and `Помощники`.

Amount tiers use four distinct care-related icons and no `01`–`04` numbering.
On phones they remain a native horizontal snap rail with a visible next-card
edge. Cadence choices also use distinct icons and explicit copy:
`Опека · каждый месяц` and `Разовая помощь · один раз`.

Every ready-state helper row has a pleasant icon and a rotating warm tone. The
feed remains a bounded vertical scroller and carries `data-lenis-prevent` on the
actual scroll container so Lenis does not consume its wheel/touch gestures.
The provider button is intrinsic-width, icon-led and uses a restrained looping
shimmer with a reduced-motion fallback. CloudPayments remains deferred, so the
button stays disabled and cannot simulate payment.

### Third visual review (2026-08-31)

The hero actions are edge-aligned rather than visually centred. `Помочь сейчас`
uses a hand/heart icon, `Найти друга` uses a paw icon, and the fixed circular
video control remains attached to the adoption action. Labels never wrap.

The donation tabs expose distinct hover, focus-visible and pressed states in
addition to the selected indicator. The four configured amounts remain native
radio cards; `Другая сумма` becomes a fifth amount card with its own labelled
number input rather than a detached field below the tiers.

The form again includes labelled name and email fields, an `Помочь анонимно`
checkbox, and explicit consent linking to `/privacy`. Anonymous mode disables
the name input but keeps email available for a future receipt. These controls
remain local draft state only: they do not submit, persist or validate against a
payment provider while the provider is deferred.

Cadence controls use visible calendar-heart and hand-coins icons. The recurring
choice reads `Опека` / `каждый месяц`; the one-time choice reads only
`Разовая помощь` without the redundant `один раз` line. Helper rows use a set of
exactly ten pleasant icons which may repeat for longer feeds. The helper panel
has one clean editorial heading, no decorative bottom rule, and preserves the
Lenis-safe nested scroller.

The wishlist section is publicly named `Нужды приюта`. Its dynamic
`N позиций нужны прямо сейчас` sentence is absent. Item actions are light warm
controls separated by a standalone `или`, never embedded inside the second
button label. Wishlist and news media become materially taller on phone and
tablet widths, while large desktop geometry remains bounded.

The volunteer section becomes a light documentary paper spread: one large real
photograph, an asymmetric ink/amber heading, an icon-led ruled action list and
one compact amber mail action. The previous near-black panel and numbered UI
rows are removed. The mobile reading order remains heading → photograph → ways
to help → action.

## Donation feed

The feed is always rendered inside its tabpanel; absence of rows must never
remove the tab or alter the outer tab shell width.

It has three explicit states:

- `ready`: render CMS rows under “Помощники”;
- `empty`: render the frame and “Здесь появятся последние подтверждённые записи”;
- `unavailable`: render the frame and “Лента временно недоступна”.

The Strapi service returns a discriminated result rather than collapsing an API
error and a genuinely empty collection into the same `[]`. Existing test rows
remain visible locally, but the heading does not say “прямо сейчас” or show a
pulsing live indicator. No fabricated fallback names or amounts are permitted.

## Volunteer section

Keep `/volunteer/walk.jpg`, the current heading, explanatory sentence, and mail
destination. Replace the centred generic hero layout with an editorial action
scene:

- left/top: oversized staggered heading with the amber hand-drawn marker
  treatment already used elsewhere on the site;
- right: a warm-paper action panel partially entering the photograph;
- panel content: three ruled, numbered rows — “выгул”, “фотосъёмка”,
  “передержка” — followed by the mail CTA;
- the person and dogs remain visible, and text contrast is provided by an
  explicit overlay rather than the photo;
- on mobile, the photograph remains a bounded scene and the paper panel follows
  it in normal document flow instead of covering the dogs.

This applies reference techniques—large editorial type, a real photographic
object, marked key words, asymmetric overlap, and one clear action—without
adding an unrelated animation system or a grid of UI cards.

## RescuedRing geometry

Only the desktop final phase changes. The accepted animation and all compact and
reduced-motion flows remain.

- increase the desktop stage from 920 px to `min(1180px, 100%)` while respecting
  viewport padding and height;
- increase the shifted ring scale from `0.62` to `0.68`;
- move it from `-25%` to `-30%` and reserve at least a 56 px visual gap before
  the text column at 1,440 px;
- widen the aside to `min(50ch, 42%)`;
- increase lead and body type one step;
- keep centre copy, orbit, aside, and gathered objects non-overlapping;
- tune measured geometry, not arbitrary breakpoints, and preserve the 900 px
  compact boundary.

The browser contract must assert a minimum horizontal gap between the shifted
visual and aside, rather than checking only that rectangles do not overlap.

## Error handling and accessibility

- Native radio/input semantics; visible labels; no placeholder-only fields.
- Arrow-key support comes from the native radio group, not a custom tab widget.
- All visible focus states have at least 3:1 contrast.
- Dynamic mood text is a single polite status region; decorative pet duplicates
  use empty alternatives so screen readers do not announce four hidden dogs.
- CMS failure affects only the feed state; the form remains readable.
- Images reserve geometry and use explicit responsive sizes.
- No provider script or payment secrets are introduced.

## Verification

### Static and unit

- pure threshold mapping tests including invalid, exact, in-between, and custom
  amounts;
- source contract that forbids `alert`, fake success timers, “прямо сейчас”, and
  conditional removal of the feed;
- semantic checks for tier radios, explicit field labels, and provider status;
- existing project tests, targeted ESLint, TypeScript, and production compiler.

### Browser

Verify installed Chrome at 320, 390, 768, 1,440, and 1,920 px:

- select every tier and custom amount; assert amount, help copy, and pet state;
- keyboard-only tier and cadence navigation;
- ready, empty, and unavailable feed states retain the same composition;
- no fake submission, alert, or network mutation;
- no page-level overflow or control/pet overlap;
- volunteer crop, panel, CTA, and reading order;
- ring text width/type size and a visible desktop gap;
- reduced-motion content parity;
- screenshots of donation, volunteer, and final ring state at mobile and desktop.

## Implementation order

1. Lock mapping, feed-state, and no-fake-payment contracts with failing tests.
2. Generate and visually verify the four Serkan masters.
3. Implement the component split and feed result contract.
4. Implement the editorial volunteer composition.
5. Tune ring geometry against measured browser rectangles.
6. Run static, compiler, browser, reduced-motion, and screenshot verification.
7. Leave the development server running for review.
