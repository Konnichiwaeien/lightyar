# Lightyar Logo System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready responsive logo kit for «Светлый» with editable SVG masters, transparent PNG exports, a PDF guide, and deterministic validation.

**Architecture:** A small generator owns the shared palette, animal paths, geometric wordmark, and five lockups. It emits self-contained SVG files; a separate export step rasterizes selected SVGs with the already-installed `sharp` package, and a verifier checks the asset contract and rendered dimensions.

**Tech Stack:** SVG 1.1, Node.js, `sharp`, built-in Node test runner, Chromium headless PDF export.

---

### Task 1: Define and verify the asset contract

**Files:**
- Create: `scripts/logo/logo-contract.mjs`
- Create: `scripts/logo/logo-assets.test.mjs`

- [ ] **Step 1: Define the expected five lockups, three color modes, PNG sizes, palette, and minimum-size rules in `logo-contract.mjs`.**
- [ ] **Step 2: Write tests that fail until every expected SVG is present, uses a `viewBox`, contains no `<image>` or external URL, and declares an accessible title.**
- [ ] **Step 3: Run `node --test scripts/logo/logo-assets.test.mjs` and confirm the missing-asset assertions fail.**

### Task 2: Generate self-contained SVG masters

**Files:**
- Create: `scripts/logo/generate-logo-assets.mjs`
- Create: `public/brand/lightyar/logo/svg/*.svg`

- [ ] **Step 1: Encode the approved palette, varied-width animal contours, and font-independent geometric Cyrillic wordmark in the generator.**
- [ ] **Step 2: Emit `primary`, `horizontal`, `symbol`, `micro`, and `official` lockups in color, mono, and inverse modes.**
- [ ] **Step 3: Run `node scripts/logo/generate-logo-assets.mjs` and inspect the emitted filenames.**
- [ ] **Step 4: Run `node --test scripts/logo/logo-assets.test.mjs` and confirm all SVG contract checks pass.**

### Task 3: Export raster and PDF deliverables

**Files:**
- Create: `scripts/logo/export-logo-assets.mjs`
- Create: `public/brand/lightyar/logo/png/*.png`
- Create: `public/brand/lightyar/logo/lightyar-logo-guide.html`
- Create: `public/brand/lightyar/logo/lightyar-logo-guide.pdf`

- [ ] **Step 1: Rasterize the approved digital variants at 16, 32, 64, 256, 512, and 1024 px as appropriate using the installed `sharp` package.**
- [ ] **Step 2: Verify PNG dimensions and alpha channels with `sharp().metadata()` and add the checks to `logo-assets.test.mjs`.**
- [ ] **Step 3: Build a one-page guide showing the five lockups, palette, safe area, minimum sizes, and incorrect-use examples.**
- [ ] **Step 4: Print the guide to PDF with local headless Chromium and confirm the file begins with `%PDF-`.**

### Task 4: Document and visually inspect the kit

**Files:**
- Create: `public/brand/lightyar/logo/README.md`
- Create: `docs/verification/lightyar-logo-contact-sheet.png`

- [ ] **Step 1: Document which asset to use for web headers, social avatars, favicon, documents, monochrome print, and dark backgrounds.**
- [ ] **Step 2: Render a contact sheet at large, 96 px, 32 px, and 16 px scales.**
- [ ] **Step 3: Inspect the contact sheet for clipped strokes, unreadable faces, incorrect transparency, and weak small-size contrast; adjust the generator if needed.**
- [ ] **Step 4: Run `node --test scripts/logo/logo-assets.test.mjs` for the final verification pass.**

