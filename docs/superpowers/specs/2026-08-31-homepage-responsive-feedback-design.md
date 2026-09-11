# Homepage Responsive Feedback Design

**Date:** 31 August 2026  
**Status:** Approved by direct screenshot feedback; implemented in the current checkout  
**Scope:** Hero controls, About, rescued ring, pet stories, and the mobile donation experience.

## Authority

This specification records the user's eight explicit screenshot annotations and
supersedes conflicting layout requirements in the 30 August homepage media
integration specification. It does not change CMS data, donation submission, or
section order. CloudPayments remains deliberately deferred and the interface
must not simulate a successful payment.

## Fixed visual contract

1. Hero actions use content-sized controls and never wrap their labels. The
   `Найти друга` link and fixed 44 px play button are one inseparable group.
   Native flex wrapping puts all controls on one line as soon as their intrinsic
   widths fit; no button stretches merely to fill the row.
2. About body highlights retain strong contrast; `большое` is the amber word and
   `дело` remains italic.
3. About metrics become a centred single column below tablet width. Their pet
   cutouts and figures scale up fluidly until the three-column tablet layout can
   carry them without collision.
4. The About panorama uses a 6:5 container. It is substantially taller than the
   previous 3:2 version, while the section's bottom padding stays compact. The
   redundant three-photo moments strip is absent.
5. Through 1180 px, the rescued portraits use one square 560 by 560 master
   geometry and a circular path. The visual does not switch into the desktop
   shifted composition at intermediate widths. `prefers-reduced-motion` still
   produces a static composition; the long copy remains in normal flow below.
6. Pet-story cards use safe viewport height units: 64svh on phones and 68svh on
   larger screens, bounded by practical minimum and maximum heights.
7. The donation experience follows the approved Fastpaw warm-blank pattern in
   Lightyar colours: Serkan is integrated into the paper form rather than placed
   in a separate colour column; the four amount cards remain the radio controls.
   A semantic segmented tab bar switches between `Помочь` and
   `Последняя помощь`; the feed is a light donor list in the second panel.
8. The unavailable-provider message is concise and explicit. It does not imply
   that money is transferred or stored.
9. The custom amount remains the final amount card. Its number input occupies a
   separate grid row below the title and explanatory copy, so it cannot cover
   either at tablet widths.
10. Anonymous help is a toggle. When active, name, receipt email and personal
    data consent are removed from the form; any previously selected consent is
    cleared. Serkan remains present and sits above the form through tablet width.
11. The rescued ring scales from the square `.ring-visual` itself. The outer
    stage is not a container-query source. The orbit remains open on every
    breakpoint: no oversized paper oval or copy mask may cover the animals.
12. The wishlist rail shows 1.5 cards from 560 through 1099 px and switches to
    the desktop density at 1100 px. Phone/tablet media is about 15 percent lower
    than the previous reviewed version, while remaining deliberately taller
    than desktop cards.
13. The volunteer section returns to a full-viewport documentary photograph
    with overlaid heading. Its three actions read as one compact warm editorial
    ledger: individually tinted icon stamps, quiet separators, and no stack of
    generic floating cards. On phones the complete copy/action composition is
    vertically centred and its CTA is centred beneath the ledger.
14. On mobile the custom amount card remains last in the horizontal rail. Its
    desktop full-row grid placement is explicitly reset at the phone breakpoint.
15. The donation heading separates the first phrase into a lighter-weight span;
    the italic accent remains the strongest typographic gesture. The introductory
    paragraph uses the full header width on phones.
16. The panorama-to-rescued transition has no decorative amber band, clipped
    ellipse or oversized separator. The rescued background begins cleanly after
    the panorama. Its copy starts with `Спасаем — и остаёмся рядом.` and does not
    repeat the `Кто мы` kicker.
17. In the wishlist still-life, wet food, dry food and litter occupy one circular
    orbit around the cat at equal 120-degree intervals. The orbit turns slowly;
    each object counter-rotates so it remains upright. Reduced-motion mode keeps
    the same equal spacing without movement.
18. VK links use a recognisable filled VK brand mark rather than a letter inside
    an outlined square.
19. Phone news media is 15 percent shorter than the previous reviewed stage:
    `clamp(22rem, 52.7svh, 30.6rem)`. Tablet sizing remains unchanged.
20. The About panorama keeps a deliberate lower breathing space before the
    rescued section. Its short description follows the organisation's supplied
    official account: ANBO "Svetly" opened in Yaroslavl in October 2024 and is
    backed by an experienced volunteer team.
21. Both rescued counters centre their numerals optically inside equal-height
    marks. The following editorial lead becomes the factual
    `Временный дом — пока не найдётся свой.`, with only `Временный дом`
    highlighted; supporting copy uses the supplied official description and
    keeps CMS-driven animal counts unchanged.
22. The donation heading is uppercase, with `НЕ СПРАВИМСЯ.` as the amber serif
    accent. Its supporting copy states plainly that the organisation has no
    government funding.
23. The volunteer heading and introduction are centred. The three help options
    are separate warm translucent editorial tags on the documentary photograph,
    not a shared white ledger. They reveal with a small stagger, lift gently on
    hover and become static under reduced-motion preferences.
24. VK links embed the official Simple Icons `vk` mark locally. They do not use
    a hand-drawn approximation or depend on a runtime CDN request.

## Responsive and accessibility rules

- Layouts must remain usable at 320, 390, 768, 1440, and 1920 px, including a
  320 by 568 short-height phone.
- No control label may depend on truncation for meaning.
- Native form controls, labels, keyboard focus, and reduced-motion behavior
  remain intact.
- Below-the-fold images reserve geometry before loading and keep meaningful
  alternative text where the image carries content.
- Critical responsive geometry uses stable component classes in global CSS so a
  development hot reload cannot collapse the panorama or story cards when a new
  arbitrary utility has not yet been emitted.

## Verification contract

- A source-contract test protects all eight decisions and runs in the full test suite.
- TypeScript and targeted ESLint must pass.
- The development route at `http://localhost:3000/#donate` must return HTTP 200.
- Visual browser review is still required before calling the desktop and mobile
  compositions finally approved; static tests do not replace screenshot QA.
