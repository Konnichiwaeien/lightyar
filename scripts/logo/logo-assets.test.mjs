import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";

import { logoContract, pngFilename } from "./logo-contract.mjs";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const logoRoot = path.join(projectRoot, "public", "brand", "lightyar", "logo");
const svgRoot = path.join(logoRoot, "svg");
const pngRoot = path.join(logoRoot, "png");

const lockups = ["primary", "horizontal", "symbol", "micro", "official"];
const modes = ["color", "mono", "inverse"];

const expectedSvgNames = lockups.flatMap((lockup) =>
  modes.map((mode) => `lightyar-${lockup}-${mode}.svg`),
);

test("logo kit contains every approved SVG lockup and color mode", async () => {
  const actualNames = await readdir(svgRoot).catch(() => []);
  const missingNames = expectedSvgNames.filter((name) => !actualNames.includes(name));

  assert.deepEqual(missingNames, []);
});

test("SVG assets are self-contained, scalable, and accessible", async () => {
  for (const filename of expectedSvgNames) {
    const source = await readFile(path.join(svgRoot, filename), "utf8").catch(() => "");

    assert.match(source, /<svg\b[^>]*\bviewBox="[^"]+"/i, `${filename} needs a viewBox`);
    assert.match(source, /<title\b[^>]*>[^<]+<\/title>/i, `${filename} needs a title`);
    assert.doesNotMatch(source, /<image\b/i, `${filename} must not embed raster images`);
    assert.doesNotMatch(source, /(?:href|src)="https?:/i, `${filename} must not use external resources`);
    assert.doesNotMatch(source, /<text\b/i, `${filename} must not depend on external fonts`);
    assert.doesNotMatch(source, /[ \t]+$/m, `${filename} must not contain trailing whitespace`);
  }
});

test("PNG exports have the requested dimensions and alpha channel", async () => {
  for (const exportGroup of logoContract.pngExports) {
    for (const size of exportGroup.sizes) {
      const filename = pngFilename(exportGroup.lockup, exportGroup.mode, size);
      const metadata = await sharp(path.join(pngRoot, filename))
        .metadata()
        .catch(() => null);

      assert.ok(metadata, `${filename} is missing or unreadable`);
      assert.equal(metadata.width, size, `${filename} has the wrong width`);
      assert.equal(metadata.hasAlpha, true, `${filename} needs a real alpha channel`);

      if (exportGroup.lockup !== "horizontal") {
        assert.equal(metadata.height, size, `${filename} has the wrong height`);
      }
    }
  }
});

test("usage guide, PDF, and contact sheet are present and readable", async () => {
  const readme = await readFile(path.join(logoRoot, "README.md"), "utf8").catch(() => "");
  const guideHtml = await readFile(path.join(logoRoot, "lightyar-logo-guide.html"), "utf8").catch(() => "");
  const guidePdf = await readFile(path.join(logoRoot, "lightyar-logo-guide.pdf")).catch(() => Buffer.alloc(0));
  const contactSheetPath = path.join(projectRoot, "docs", "verification", "lightyar-logo-contact-sheet.png");
  const contactSheet = await sharp(contactSheetPath).metadata().catch(() => null);

  assert.match(readme, /# Комплект логотипа «Светлый»/);
  assert.match(guideHtml, /#E9A91B/i);
  assert.match(guideHtml, /lightyar-primary-color\.svg/);
  assert.equal(guidePdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.ok(guidePdf.length > 20_000, "PDF guide is unexpectedly small");
  assert.ok(contactSheet, "contact sheet is missing or unreadable");
  assert.equal(contactSheet.width, 1600);
});

test("downloadable ZIP package is present", async () => {
  const zipPath = path.join(projectRoot, "public", "brand", "lightyar", "lightyar-logo-kit.zip");
  const archive = await readFile(zipPath).catch(() => Buffer.alloc(0));

  assert.equal(archive.subarray(0, 2).toString("ascii"), "PK");
  assert.ok(archive.length > 100_000, "ZIP package is unexpectedly small");
});
