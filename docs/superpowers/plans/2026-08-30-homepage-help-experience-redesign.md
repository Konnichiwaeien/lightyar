# Homepage Help Experience Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fake donation UI with a componentised Serkan-led help experience, keep the donation feed truthful and permanent, redesign the volunteer call to action, and correct the desktop rescued-ring geometry.

**Architecture:** Server Components continue to fetch Strapi data and pass a discriminated feed result to one client-side `DonationExperience` state owner. Pure tier mapping lives in `lib/donations`; visual children own no shared state. Volunteer and ring changes remain component-scoped and preserve the verified mobile/reduced-motion layouts.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, component CSS, Framer Motion 12, `next/image`, Node test runner, Playwright Core, installed Chrome, Sharp.

**Execution note:** Work in the current mixed checkout. Do not commit, reset, clean, move, or rewrite unrelated files. The user explicitly requested inline execution without further questions.

---

### Task 1: Lock the donation domain and no-fake-payment contract

**Files:**
- Create: `lib/donations/donation-tiers.ts`
- Create: `lib/donations/get-donation-tier.ts`
- Create: `lib/donations/get-donation-tier.test.ts`
- Create: `components/donations/donation-structure.test.mjs`

- [ ] **Step 1: Write the failing threshold test**

Test exact boundaries, in-between values, zero, negative, `NaN`, and infinity:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { getDonationTier } from "./get-donation-tier.ts";

test("maps arbitrary amounts to the greatest configured threshold", () => {
  assert.equal(getDonationTier(299).id, "food");
  assert.equal(getDonationTier(300).id, "food");
  assert.equal(getDonationTier(999).id, "care");
  assert.equal(getDonationTier(1000).id, "diagnostics");
  assert.equal(getDonationTier(2999).id, "diagnostics");
  assert.equal(getDonationTier(3000).id, "treatment");
  assert.equal(getDonationTier(Number.NaN).id, "food");
  assert.equal(getDonationTier(Number.POSITIVE_INFINITY).id, "food");
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```powershell
& $nodeExe --experimental-strip-types --test lib/donations/get-donation-tier.test.ts
```

Expected: FAIL because the domain files do not exist.

- [ ] **Step 3: Implement the immutable configuration and pure mapper**

Define:

```ts
export type DonationTierId = "food" | "care" | "diagnostics" | "treatment";
export type SerkanMood = "worried" | "cautious" | "relieved" | "trusting";

export interface DonationTier {
  id: DonationTierId;
  amount: number;
  shortLabel: string;
  description: string;
  mood: SerkanMood;
  moodLabel: string;
}

export const DONATION_TIERS = [
  { id: "food", amount: 300, shortLabel: "Корм", description: "Помогает с запасом корма", mood: "worried", moodLabel: "Серкан ещё тревожится" },
  { id: "care", amount: 500, shortLabel: "Забота", description: "Помогает с обработкой и базовыми лекарствами", mood: "cautious", moodLabel: "Серкан присматривается" },
  { id: "diagnostics", amount: 1000, shortLabel: "Диагностика", description: "Помогает с осмотром и анализами", mood: "relieved", moodLabel: "Серкан заметно расслабился" },
  { id: "treatment", amount: 3000, shortLabel: "Лечение", description: "Помогает оплатить этап лечения", mood: "trusting", moodLabel: "Серкан чувствует поддержку" },
] as const satisfies readonly DonationTier[];
```

`getDonationTier` returns the first tier for a non-finite or sub-minimum amount,
otherwise the greatest threshold not exceeding the amount.

- [ ] **Step 4: Write the source contract before component implementation**

Read the future donation files and assert semantic radio inputs, explicit labels,
an always-rendered `DonationFeed`, provider copy, and absence of these patterns:

```js
assert.doesNotMatch(payment, /alert\s*\(/);
assert.doesNotMatch(payment, /setTimeout\s*\(/);
assert.doesNotMatch(allDonationSource, /прямо сейчас/i);
assert.match(fields, /aria-disabled="true"/);
assert.match(fields, /Онлайн-оплата подключается/);
assert.match(picker, /type="radio"/);
assert.match(feed, /status === "empty"/);
assert.match(feed, /status === "unavailable"/);
```

- [ ] **Step 5: Run tests and confirm mapper GREEN / source contract RED**

Expected: mapper PASS; source contract FAIL because components do not exist.

### Task 2: Produce and verify four Serkan mood masters

**Files:**
- Source: `public/pets/cutout-serkan.webp`
- Create: `public/donate/serkan/worried.webp`
- Create: `public/donate/serkan/cautious.webp`
- Create: `public/donate/serkan/relieved.webp`
- Create: `public/donate/serkan/trusting.webp`
- Create: `scripts/check-serkan-moods.mjs`
- Create: `docs/verification/help-experience/serkan-contact-sheet.png`

- [ ] **Step 1: Inspect the real source at original resolution**

Record width, height, alpha bounds, and inspect the WebP visually before editing.

- [ ] **Step 2: Generate a same-identity four-state set**

Use the image generation edit workflow with the real cutout as the reference and
this fixed identity contract:

```text
Create four full-body transparent-background states of this exact real dog,
Serkan. Preserve coat colours, black facial mask, ear shape, muzzle, proportions,
age and lighting direction. One consistent camera, canvas, scale and floor line.
States: worried/low cautious posture; attentive but uncertain; visibly relieved
and relaxed; calm trusting open posture. Natural canine body language only, no
human smile, tears, costume, props, text, borders, or invented markings.
```

- [ ] **Step 3: Normalise assets mechanically**

Use Sharp to place every approved state on the same transparent 1200×1500 canvas,
trim only transparent margins, preserve alpha, and export quality-90 WebP.

- [ ] **Step 4: Add deterministic media checks**

`check-serkan-moods.mjs` asserts all four files exist, are 1200×1500, have alpha,
contain non-transparent pixels, stay within 8% baseline variance, and have no
opaque pixels touching the outer four-pixel frame.

- [ ] **Step 5: Render and inspect a contact sheet**

Composite every state on warm paper and navy panels. Reject identity drift,
clipped fur, bright alpha halos, mismatched scale, or a caricatured expression.

### Task 3: Split the donation experience into focused components

**Files:**
- Create: `lib/donations/donation-feed-state.ts`
- Create: `components/donations/donation-experience.tsx`
- Create: `components/donations/donation-pet.tsx`
- Create: `components/donations/donation-tier-picker.tsx`
- Create: `components/donations/donation-fields.tsx`
- Create: `components/donations/donation-feed.tsx`
- Create: `components/donations/donation-experience.css`
- Modify: `components/sections/payment-section.tsx`

- [ ] **Step 1: Define the shared feed result**

```ts
export interface RecentDonation {
  name: string;
  amount: number;
  type: "once" | "monthly";
}

export type DonationFeedState =
  | { status: "ready"; items: RecentDonation[] }
  | { status: "empty"; items: [] }
  | { status: "unavailable"; items: [] };
```

- [ ] **Step 2: Implement the tier picker with native radios**

Use a `<fieldset>`/`<legend>`, one labelled radio per tier, `checked`, and
`onChange`. Each label exposes amount, short label, and help description. The
selected state uses `.donation-tier[data-selected="true"]` plus a text marker.

- [ ] **Step 3: Implement the aligned pet scene**

Render one keyed `next/image` from `/donate/serkan/${tier.mood}.webp` inside a
fixed-ratio wrapper. Crossfade with `AnimatePresence`, mark the image decorative,
and expose `tier.moodLabel` once through `<p role="status" aria-live="polite">`.

- [ ] **Step 4: Implement fields without fake submission**

Use visible labels, `autocomplete="name"`, `autocomplete="email"`,
`inputMode="numeric"`, 48 px targets, and a disabled provider button:

```tsx
<button type="button" disabled aria-disabled="true" className="donation-provider-button">
  Онлайн-оплата подключается
</button>
<p className="donation-provider-note">
  Выбор сохранится только на этой странице — платёж пока не отправляется.
</p>
```

No submit handler, timer, alert, success panel, or mutation request is added.

- [ ] **Step 5: Implement all feed states in one stable region**

Always render `<aside className="donation-feed">`. `ready` renders rows;
`empty` and `unavailable` render distinct inline status copy. Use heading
“Последняя помощь” and subheading “Недавние записи фонда”. Do not use a live dot.

- [ ] **Step 6: Implement the single state owner**

`DonationExperience` owns cadence, amount string, selected tier, donor name,
email, and anonymous state. Tier selection updates amount; amount input derives
tier with `getDonationTier`. Children receive values and callbacks only.

- [ ] **Step 7: Reduce `PaymentSection` to section composition**

Keep the approved heading copy. Remove the old component state, validation,
portrait rail, fake handler, and conditional `hasDonations` layout. Render:

```tsx
<DonationExperience feed={feed} />
```

- [ ] **Step 8: Run the source contract and focused TypeScript test**

Expected: all donation structure and mapping tests PASS.

### Task 4: Preserve the feed distinction through Strapi and the homepage

**Files:**
- Modify: `lib/api/services/donations.ts`
- Modify: `app/page.tsx`
- Modify: `lib/api/services/editorial-services.test.mjs`

- [ ] **Step 1: Write the failing service source contract**

Require a discriminated raw result and reject `catch { return [] }` for this
service. Assert `ready`, `empty`, and `unavailable` string literals exist.

- [ ] **Step 2: Return a discriminated API result**

```ts
export type DonationsApiResult =
  | { status: "ready"; donations: StrapiDonation[] }
  | { status: "empty"; donations: [] }
  | { status: "unavailable"; donations: [] };
```

Return `empty` for a successful empty response and `unavailable` in `catch`.

- [ ] **Step 3: Map the result in `app/page.tsx`**

Initialise `donationFeed` to unavailable. Map non-empty rows to `ready`; preserve
empty/unavailable without invented entries. Pass `<PaymentSection feed={donationFeed} />`.

- [ ] **Step 4: Run service, structure, and project tests**

Expected: focused tests and the existing test suite PASS.

### Task 5: Replace the generic volunteer overlay with an editorial action scene

**Files:**
- Modify: `components/sections/volunteer-section.tsx`
- Create: `components/sections/volunteer-section.css`
- Modify: `components/sections/homepage-media-structure.test.mjs`

- [ ] **Step 1: Extend the source contract**

Require `.volunteer-editorial`, `.volunteer-action-panel`, exactly three
`.volunteer-role` rows, the existing image and mail destination, and a decorative
image alt.

- [ ] **Step 2: Implement semantic editorial markup**

The section contains the background photo, a left text block with the existing
heading and sentence, and a `<aside>` paper panel with an ordered list:

```tsx
const ROLES = [
  ["01", "Выгул", "Познакомиться с собаками и подарить им движение"],
  ["02", "Фотосъёмка", "Сделать кадры, по которым питомца заметят"],
  ["03", "Передержка", "Дать временный дом и спокойную бытовую жизнь"],
] as const;
```

Keep the existing email CTA and subject.

- [ ] **Step 3: Implement desktop overlap and mobile flow in scoped CSS**

Desktop uses a two-column 1200 px stage, large left heading, and paper panel
overlapping the right photo edge. Mobile turns the photograph into a bounded
aspect-ratio scene and places the paper panel in normal flow. Preserve image
subject visibility, 48 px CTA target, focus ring, and reduced-motion parity.

- [ ] **Step 4: Run the source contract and targeted lint**

Expected: PASS with no new lint errors.

### Task 6: Enlarge and separate the desktop rescued ring

**Files:**
- Modify: `components/sections/rescued-ring.tsx`
- Modify: `components/sections/rescued-ring.css`
- Modify: `scripts/check-rescued-ring-layout.mjs`

- [ ] **Step 1: Extend the browser contract before CSS changes**

At 1440 px final phase, record `.ring-visual` and `.ring-aside` rectangles and
computed type. Require aside width at least 430 px, lead font at least 38 px,
note font at least 16 px, and at least 56 px between the shifted centre/orbit
content bound and aside. Keep existing no-overlap, mobile flow, and reduced-motion
checks.

- [ ] **Step 2: Run the ring check and confirm RED**

Expected: FAIL on width, typography, or gap under the current 920 px stage.

- [ ] **Step 3: Apply the approved desktop geometry**

Change `.ring-stage` to `width: min(1180px, 100%)`, aside to
`width: min(50ch, 42%)`, lead to `clamp(1.9rem, 2.7vw, 2.55rem)`, and notes to
`clamp(1rem, 1.15vw, 1.08rem)`. Change final orbit scale to `0.68`, orbit x to
`-30%`, and centre x to `-30%`. Align `.ring-gather` with the new aside width.
Do not change `max-width: 900px` or reduced-motion flow declarations.

- [ ] **Step 4: Run the ring matrix and tune only measured geometry**

Expected: PASS at 1440, 768, 390, 320 and desktop reduced motion. If the 56 px
gap fails, change one of stage width, x offset, aside width, or gathered-object
position and re-run before any second change.

### Task 7: Add end-to-end browser acceptance and visual evidence

**Files:**
- Create: `scripts/check-help-experience.mjs`
- Modify: `package.json`
- Create: `docs/verification/help-experience/donation-320.png`
- Create: `docs/verification/help-experience/donation-1440.png`
- Create: `docs/verification/help-experience/volunteer-320.png`
- Create: `docs/verification/help-experience/volunteer-1440.png`
- Create: `docs/verification/help-experience/ring-1440.png`

- [ ] **Step 1: Add the repeatable browser script**

Launch installed Chrome at 320, 390, 768, 1440, and 1920. Collect page errors,
failed local assets, and page overflow. For donation, select every radio and type
`750` and `3200`; assert amount copy, mood status, current image filename, stable
feed width, and no alert/dialog/mutation request. Verify keyboard radio movement.

- [ ] **Step 2: Add the package command**

```json
"test:help-experience": "node scripts/check-help-experience.mjs http://localhost:3000"
```

- [ ] **Step 3: Run static verification**

```powershell
& $nodeExe --experimental-strip-types --test lib/donations/get-donation-tier.test.ts
& $nodeExe --test components/donations/donation-structure.test.mjs components/sections/homepage-media-structure.test.mjs lib/api/services/editorial-services.test.mjs
& $nodeExe node_modules/eslint/bin/eslint.js components/donations components/sections/payment-section.tsx components/sections/volunteer-section.tsx lib/donations lib/api/services/donations.ts app/page.tsx scripts/check-help-experience.mjs scripts/check-rescued-ring-layout.mjs
& $nodeExe node_modules/typescript/bin/tsc --noEmit
```

Expected: PASS with zero new errors.

- [ ] **Step 4: Run the existing project suite and production compiler**

Run `npm test` through the bundled Node runtime and `next build`. If prerender is
blocked only by the documented offline Strapi/dynamic-news issue, preserve the
exact error separately; changed-file TypeScript and webpack compilation must pass.

- [ ] **Step 5: Run browser and reduced-motion matrices**

Run `check-serkan-moods.mjs`, `check-help-experience.mjs`,
`check-rescued-ring-layout.mjs`, and the existing homepage media check. Expected:
all local assets 200, no hydration/page errors, no overflow, and readable
reduced-motion content.

- [ ] **Step 6: Capture and inspect five acceptance screenshots**

Wait for images to report `complete && naturalWidth > 0`. Reject cropped Serkan,
pet/control overlap, disappearing feed, generic centred volunteer layout, or a
ring/aside gap below the contract.

- [ ] **Step 7: Leave the dev server running**

Keep the healthy existing server on `http://localhost:3000`; start the webpack
server only if the port is not already serving the current checkout.
