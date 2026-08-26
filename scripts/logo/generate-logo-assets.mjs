import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { logoContract, svgFilename } from "./logo-contract.mjs";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const svgRoot = path.join(projectRoot, "public", "brand", "lightyar", "logo", "svg");

const GLYPHS = {
  "А": { width: 72, d: "M6 94 L35 6 L66 94 M18 60 H54" },
  "Б": { width: 66, d: "M10 6 V94 M10 6 H58 M10 46 H36 C67 46 67 94 36 94 H10" },
  "В": { width: 68, d: "M10 6 V94 M10 6 H34 C58 6 61 43 35 48 H10 M35 48 C66 48 67 94 35 94 H10" },
  "Е": { width: 64, d: "M58 6 H10 V94 H58 M10 49 H49" },
  "Й": { width: 74, d: "M10 6 V94 L64 6 V94 M22 -8 C30 3 44 3 52 -8" },
  "Л": { width: 72, d: "M5 94 L29 6 H45 L68 94" },
  "Н": { width: 72, d: "M10 6 V94 M62 6 V94 M10 49 H62" },
  "О": { width: 74, d: "M37 5 C14 5 7 25 7 50 C7 77 16 95 37 95 C59 95 67 76 67 50 C67 24 59 5 37 5 Z" },
  "С": { width: 70, d: "M62 18 C51 7 38 5 28 9 C11 15 7 31 7 50 C7 75 19 94 39 95 C49 95 58 91 64 83" },
  "Т": { width: 70, d: "M5 6 H65 M35 6 V94" },
  "Ы": { width: 88, d: "M10 6 V94 M10 50 H34 C64 50 64 94 34 94 H10 M78 6 V94" },
};

function palette(mode) {
  if (mode === "mono") {
    return { ink: "#111111", accent: "#111111", surface: "#FFFFFF", outer: "#111111" };
  }

  if (mode === "inverse") {
    return {
      ink: logoContract.palette.paper,
      accent: logoContract.palette.amber,
      surface: "none",
      outer: logoContract.palette.paper,
    };
  }

  return {
    ink: logoContract.palette.ink,
    accent: logoContract.palette.amber,
    surface: logoContract.palette.paper,
    outer: logoContract.palette.ink,
  };
}

function svgDocument({ viewBox, title, content }) {
  const source = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="${viewBox}">`,
    `  <title>${title}</title>`,
    '  <g fill="none" stroke-linecap="round" stroke-linejoin="round">',
    content,
    "  </g>",
    "</svg>",
    "",
  ].join("\n");

  return source.replace(/[ \t]+$/gm, "");
}

function animalArtwork(ink) {
  return `
    <g stroke="${ink}" stroke-width="14">
      <!-- Dog: an open portrait contour, soft hanging ear and broad muzzle -->
      <path d="M90 464 C88 405 119 351 174 325 C229 299 303 306 352 340"/>
      <path d="M352 340 C391 367 408 408 398 453 C393 480 380 503 356 520"/>
      <path d="M356 520 C323 558 269 577 213 570 C160 565 119 536 100 496"/>
      <path d="M142 346 C106 338 78 369 77 421 C75 467 94 499 123 503 C151 506 173 476 172 433 C171 394 158 350 142 346 Z"/>
      <path d="M182 330 C218 315 265 316 301 330" stroke-width="9"/>
      <path d="M318 352 C343 370 354 395 350 421" stroke-width="9"/>
      <path d="M196 417 C214 405 238 405 254 418" stroke-width="9"/>
      <path d="M301 414 C317 403 337 405 349 417" stroke-width="9"/>
      <path d="M225 475 C244 458 270 454 291 463 C313 459 338 470 346 489 C353 507 344 525 326 535 C300 549 260 546 236 530" stroke-width="10"/>
      <path d="M269 475 C279 467 294 468 304 477 C304 490 294 499 283 499 C272 499 264 488 269 475 Z" fill="${ink}" stroke="none"/>
      <path d="M283 499 C280 520 265 533 245 535 M283 499 C289 518 306 528 325 523" stroke-width="8"/>
      <path d="M228 492 C208 486 191 488 176 499 M230 509 C210 509 194 517 181 528" stroke-width="6"/>
      <circle cx="229" cy="424" r="7" fill="${ink}" stroke="none"/>
      <circle cx="327" cy="422" r="7" fill="${ink}" stroke="none"/>
      <circle cx="242" cy="472" r="3.5" fill="${ink}" stroke="none"/>
      <circle cx="226" cy="480" r="3.5" fill="${ink}" stroke="none"/>
      <circle cx="331" cy="468" r="3.5" fill="${ink}" stroke="none"/>
    </g>

    <g stroke="${ink}" stroke-width="14">
      <!-- Horse: a narrow head, attentive ears and a loose mane -->
      <path d="M623 347 C626 302 645 263 681 231"/>
      <path d="M681 231 C675 194 683 151 706 132 C727 158 729 194 716 224"/>
      <path d="M742 220 C741 181 756 143 781 136 C795 170 792 207 776 235"/>
      <path d="M716 224 C736 207 760 207 779 224 C806 249 808 287 830 320 C862 368 872 424 858 483"/>
      <path d="M858 483 C846 547 806 605 748 624 C695 641 641 620 615 575 C587 526 603 474 626 422 C640 391 637 368 623 347"/>
      <path d="M622 335 C602 307 598 269 611 244 C628 259 640 280 646 306" stroke-width="9"/>
      <path d="M800 231 C831 249 855 279 864 314 M813 256 C846 289 864 326 868 363 M823 289 C851 327 865 369 862 407" stroke-width="9"/>
      <path d="M654 354 C672 342 696 343 711 357" stroke-width="9"/>
      <path d="M637 402 C651 411 668 412 683 404" stroke-width="8"/>
      <path d="M678 510 C705 493 748 490 782 508 C797 516 805 528 802 541 C796 575 767 594 733 591 C697 589 672 562 678 510 Z" stroke-width="10"/>
      <path d="M697 535 C709 544 721 546 732 538 M765 538 C776 531 787 533 795 540" stroke-width="7"/>
      <circle cx="682" cy="365" r="7" fill="${ink}" stroke="none"/>
      <path d="M702 432 C720 443 742 444 760 432" stroke-width="7"/>
    </g>

    <g stroke="${ink}" stroke-width="14">
      <!-- Cat: a smaller lower anchor echoing the original composition -->
      <path d="M365 741 C365 677 405 636 461 630 C485 627 505 632 522 642 C541 631 563 628 585 634 C641 649 667 699 653 755 C639 807 591 835 524 832 C457 837 401 815 378 773 C369 758 365 748 365 741 Z"/>
      <path d="M398 660 L385 601 L451 635 M578 637 L640 600 L626 670"/>
      <path d="M418 667 C438 650 462 650 481 666 M557 666 C577 652 600 654 617 672" stroke-width="9"/>
      <path d="M421 720 C438 708 459 708 474 719 M565 718 C582 707 604 710 618 722" stroke-width="8"/>
      <path d="M506 751 C516 743 533 743 544 751 C542 765 533 773 523 773 C512 773 504 763 506 751 Z" fill="${ink}" stroke="none"/>
      <path d="M523 773 C519 790 506 799 490 802 M523 773 C529 788 542 797 558 799" stroke-width="8"/>
      <path d="M476 763 C431 754 399 757 371 769 M477 780 C433 779 400 787 374 801 M574 762 C615 753 648 758 678 772 M574 781 C616 779 648 789 674 804" stroke-width="6"/>
      <circle cx="449" cy="725" r="6.5" fill="${ink}" stroke="none"/>
      <circle cx="592" cy="724" r="6.5" fill="${ink}" stroke="none"/>
    </g>`;
}

function glyph(letter, { x = 0, y = 0, scale = 1, rotation = 0, color, strokeWidth = 14 } = {}) {
  const shape = GLYPHS[letter];
  if (!shape) throw new Error(`Unsupported geometric glyph: ${letter}`);

  return `<g transform="translate(${x} ${y}) rotate(${rotation}) scale(${scale}) translate(${-shape.width / 2} -50)" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="${shape.d}"/></g>`;
}

function curvedWordmark(color) {
  const letters = [...logoContract.brand.toUpperCase()];
  const angles = [-151, -140.7, -130.3, -120, -109.7, -99.3, -89];
  const radius = 393;

  return letters
    .map((letter, index) => {
      const angle = angles[index];
      const radians = (angle * Math.PI) / 180;
      const x = 500 + radius * Math.cos(radians);
      const y = 445 + radius * Math.sin(radians);
      return glyph(letter, { x: x.toFixed(2), y: y.toFixed(2), scale: 0.64, rotation: angle + 90, color, strokeWidth: 18 });
    })
    .join("\n");
}

function straightWordmark(word, { x, y, height, color, gap = 18, strokeWidth = 14 }) {
  const letters = [...word.toUpperCase()];
  const baseWidth = letters.reduce((sum, letter) => sum + GLYPHS[letter].width, 0) + gap * (letters.length - 1);
  const scale = height / 100;
  let cursor = x;
  const content = [];

  for (const letter of letters) {
    const shape = GLYPHS[letter];
    const center = cursor + (shape.width * scale) / 2;
    content.push(glyph(letter, { x: center, y: y + height / 2, scale, color, strokeWidth }));
    cursor += (shape.width + gap) * scale;
  }

  return { content: content.join("\n"), width: baseWidth * scale };
}

function badge(mode, { withWordmark = true } = {}) {
  const colors = palette(mode);
  const artworkTransform = withWordmark ? "" : ' transform="translate(-25 -34) scale(1.05)"';

  return `
    <circle cx="500" cy="500" r="462" fill="${colors.surface}" stroke="${colors.outer}" stroke-width="18"/>
    ${withWordmark ? curvedWordmark(colors.accent) : ""}
    <g${artworkTransform}>${animalArtwork(colors.ink)}</g>`;
}

function primary(mode) {
  return svgDocument({
    viewBox: "0 0 1000 1000",
    title: `Светлый — основной логотип, ${mode}`,
    content: badge(mode),
  });
}

function symbol(mode) {
  return svgDocument({
    viewBox: "0 0 1000 1000",
    title: `Светлый — знак без надписи, ${mode}`,
    content: badge(mode, { withWordmark: false }),
  });
}

function horizontal(mode, { official = false } = {}) {
  const colors = palette(mode);
  const mark = `<g transform="translate(34 34) scale(0.63)">${badge(mode, { withWordmark: false })}</g>`;
  const word = straightWordmark(logoContract.brand, {
    x: 720,
    y: official ? 250 : 280,
    height: 150,
    color: colors.accent,
    gap: 18,
    strokeWidth: 13,
  });
  const prefix = official
    ? straightWordmark("АНБО", { x: 725, y: 152, height: 62, color: colors.ink, gap: 20, strokeWidth: 12 }).content
    : "";
  const underline = official
    ? `<path d="M725 470 H${Math.min(1560, 725 + word.width)}" stroke="${colors.ink}" stroke-width="9"/>`
    : "";

  return svgDocument({
    viewBox: "0 0 1600 700",
    title: official ? `АНБО Светлый — официальный логотип, ${mode}` : `Светлый — горизонтальный логотип, ${mode}`,
    content: `${mark}\n${prefix}\n${word.content}\n${underline}`,
  });
}

function micro(mode) {
  const colors = palette(mode);
  const background = mode === "inverse" ? logoContract.palette.ink : colors.accent;
  const foreground = mode === "inverse" ? logoContract.palette.paper : colors.ink;

  return svgDocument({
    viewBox: "0 0 256 256",
    title: `Светлый — микрознак, ${mode}`,
    content: `
    <circle cx="128" cy="128" r="116" fill="${background}" stroke="${mode === "mono" ? colors.ink : background}" stroke-width="8"/>
    <path d="M35 116 C38 76 67 58 99 72 C116 80 119 104 106 122 C93 139 61 138 45 125 C39 121 36 118 35 116 Z" fill="${foreground}" stroke="none"/>
    <path d="M150 72 C153 47 164 35 175 57 C186 37 198 43 195 70 C215 91 212 125 190 142 C169 157 145 140 145 114 C145 96 152 85 150 72 Z" fill="${foreground}" stroke="none"/>
    <path d="M74 181 C76 151 96 137 124 151 C148 136 175 150 179 181 C178 210 155 226 126 226 C96 226 74 210 74 181 Z M91 153 L86 132 L111 148 M145 148 L169 131 L164 158" fill="${foreground}" stroke="none"/>
    <circle cx="76" cy="103" r="5" fill="${background}" stroke="none"/>
    <circle cx="173" cy="103" r="5" fill="${background}" stroke="none"/>
    <circle cx="111" cy="181" r="4" fill="${background}" stroke="none"/>
    <circle cx="145" cy="181" r="4" fill="${background}" stroke="none"/>`,
  });
}

const renderers = {
  primary,
  horizontal,
  symbol,
  micro,
  official: (mode) => horizontal(mode, { official: true }),
};

await mkdir(svgRoot, { recursive: true });

for (const lockup of logoContract.lockups) {
  for (const mode of logoContract.modes) {
    const filename = svgFilename(lockup, mode);
    await writeFile(path.join(svgRoot, filename), renderers[lockup](mode), "utf8");
  }
}

console.log(`Generated ${logoContract.lockups.length * logoContract.modes.length} SVG logo assets in ${svgRoot}`);
