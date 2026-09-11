# Homepage layout polish

## Scope

Polish the existing homepage without replacing its content model, real animal cutouts, or section order. The work covers the About panorama, the rescued-pets ring, donation form, section backgrounds, and volunteer actions.

## About panorama

- Keep the current documentary group photograph and rounded frame.
- On screens below 768 px, reduce the frame height by 15% relative to the current `6 / 5` ratio. The target ratio is `24 / 17`.
- From 768 px upward, reduce the frame height by 50% relative to the current ratio. The target ratio is `12 / 5`.
- Anchor the crop toward the people and animals at the bottom of the photograph so reducing the sky does not remove faces or dogs.
- Set the homepage About section background to pure white.

## Rescued-pets ring

- Set the section sheet to white while retaining the existing amber glow as an internal visual accent, not as the section background.
- Preserve the restored single-path orbit implementation and its motion timing. Do not rewrite the orbit animation.
- Vertically center `79` and `72` inside equal-height marker boxes using inline flex alignment and tabular numerals.
- Replace the lead with the factual line: `Забираем с улицы. Лечим. Ищем дом.`
- Underline `Ищем дом.` with the same amber editorial stroke language used elsewhere on the homepage. The underline must sit behind the text and remain legible on wrapped mobile lines.

## Donation form

- Keep the existing payment behavior and fields unchanged.
- On desktop, reduce panel minimum height, form padding, internal gaps, and tier-card height. The form remains comfortably tappable and readable.
- Keep the amount grid at two columns. `Другая сумма` occupies one normal grid cell instead of stretching across the full row.
- Place the dog at the upper-right edge as an overlapping layer behind the form surface. The form edge must visually cover part of the dog so it reads as standing behind the panel, while the head and body remain visible above and outside it.
- On tablet and mobile, reposition and scale the dog independently to avoid covering controls, headings, or tabs.

## Volunteer section

- Use the editorial restraint of the Few and Far reference rather than rounded app-style cards.
- Keep the photograph as the dominant background.
- Add one warm-white editorial panel that overlaps the lower part of the photograph.
- Present the three roles as columns separated by thin rules: large amber `01 / 02 / 03`, a small line icon, title, and concise description.
- Avoid individual card shadows, pills, glass blur, and heavy rounding.
- On screens up to 960 px, convert the columns into three stacked rows with horizontal separators.
- Motion: stagger rows/columns into view; on hover or keyboard focus, shift the number slightly and draw an amber underline. Disable movement for reduced-motion users.
- Keep the centered application button below the roles.

## Responsive and visual acceptance

- Verify the homepage in the real browser at 320, 390, 557, 768, 1024, 1440, and 1920 px widths.
- At every width: no horizontal overflow, clipped copy, overlapping controls, smeared outer card edges, or dog/form collisions.
- The panorama keeps people and animals visible after cropping.
- The rescued-pets orbit remains smooth and stable; pet cutouts do not jitter.
- Donation controls remain keyboard accessible and retain at least a 44 px effective target height.
- Volunteer roles remain fully readable without requiring hover or tap.

## Non-goals

- No changes to donation submission logic, CMS data, pet counts, route order, or the rescued-ring motion algorithm.
- No new dependencies and no generated replacement animal imagery.
