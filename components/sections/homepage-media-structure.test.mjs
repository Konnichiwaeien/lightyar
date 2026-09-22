import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("About keeps one shortened documentary panorama without a redundant triptych", async () => {
  const [source, css] = await Promise.all([
    read("./about-section.tsx"),
    read("../../app/globals.css"),
  ]);

  assert.doesNotMatch(source, /ABOUT_MOMENTS|about-moments|moment-[123]\.jpg/);
  assert.match(source, /src=\{imageUrl \|\| "\/about\/panorama\.jpg"\}/);
  assert.match(source, /alt="Собаки в приюте Светлый на прогулке"/);
  assert.match(source, /about-panorama/);
  assert.match(css, /\.about-panorama\s*\{[\s\S]*?aspect-ratio:\s*24\s*\/\s*17/);
  assert.match(css, /@media \(min-width: 48rem\)[\s\S]*?\.about-panorama\s*\{[\s\S]*?aspect-ratio:\s*12\s*\/\s*5/);
  assert.match(source, /sizes="\(max-width: 768px\) 100vw/);
});

test("Donation and volunteer scenes use responsive Next images", async () => {
  const [donationPet, volunteer] = await Promise.all([
    read("../donations/donation-pet.tsx"),
    read("./volunteer-section.tsx"),
  ]);

  assert.match(donationPet, /import Image from "next\/image"/);
  assert.match(donationPet, /donation-pet__image/);
  assert.match(donationPet, /sizes="\(max-width: 767px\) 94vw/);

  assert.match(volunteer, /import Image from "next\/image"/);
  assert.ok(volunteer.includes('src={imageUrl || "/about/panorama.jpg"}'));
  assert.ok(volunteer.includes('alt=""'));
  assert.ok(volunteer.includes('sizes="100vw"'));
  assert.match(volunteer, /className="volunteer-scene/);
  assert.match(volunteer, /md:object-\[50%_48%\]/);
  assert.match(volunteer, /className="volunteer-editorial/);
  assert.match(volunteer, /className="volunteer-action-panel/);
  assert.equal((volunteer.match(/className="volunteer-role"/g) || []).length, 1);
  assert.match(volunteer, /VOLUNTEER_ROLES\.map/);
  assert.match(volunteer, /Footprints/);
  assert.match(volunteer, /Camera/);
  assert.match(volunteer, /HouseHeart/);
});

test("Film grain uses the installed tile", async () => {
  const css = await read("../../app/globals.css");
  const grain = css.match(/\.film-grain\s*\{[^}]*\}/)?.[0];
  assert.ok(grain, "film grain has its own style rule");

  assert.match(grain, /background-image:\s*url\("\/texture\/paper-grain\.png"\)/);
  assert.match(grain, /opacity:\s*0\.04/);
  assert.match(grain, /background-size:\s*512px 512px/);
  assert.doesNotMatch(grain, /feTurbulence|data:image\/svg\+xml/);
});

test("Homepage grain alpha mask stays visually equivalent to the original multiply tile", async () => {
  const css = await read("../../app/globals.css");
  const rule = css.match(/\.home-film-grain\s*\{[^}]*\}/)?.[0];
  assert.ok(rule);
  assert.match(rule, /mix-blend-mode:\s*normal/);
  assert.match(rule, /mask-image:\s*url\("\/texture\/paper-grain\.png"\)/);
  const blackAlpha = Number(rule.match(/background-color:\s*rgb\(0 0 0 \/ ([\d.]+)%\)/)?.[1]) / 100;
  const tile = await sharp(fileURLToPath(new URL("../../public/texture/paper-grain.png", import.meta.url))).stats();
  const alpha = tile.channels[3].max / 255;
  for (const channel of tile.channels.slice(0, 3)) {
    assert.equal(channel.min, channel.max, "the conversion assumes a constant-color alpha tile");
    const worstError = Math.abs(255 - channel.max - 255 * blackAlpha) * alpha * 0.04;
    assert.ok(worstError < 0.1, `visible grain color drift: ${worstError}`);
  }
});

test("Mobile media stays lightweight while the requested compact orbit keeps moving", async () => {
  const [hero, ring, css] = await Promise.all([
    read("./hero-section.tsx"),
    read("./rescued-ring.tsx"),
    read("../../app/globals.css"),
  ]);

  assert.match(hero, /navigator[\s\S]*?connection/);
  assert.match(hero, /saveData/);
  assert.match(hero, /slow-2g|2g/);
  assert.match(hero, /allowVideo\s*&&/);
  assert.match(hero, /hero-media-layer/);

  assert.match(ring, /ringVisible\s*=\s*useInView\(sectionRef/);
  assert.match(ring, /pauseOrbit=\{still\s*\|\|\s*!ringVisible\}/);
  assert.doesNotMatch(ring, /pauseOrbit=\{[^}]*compact/);

  assert.match(css, /@media\s*\(max-width:\s*767px\)[\s\S]*?\.film-grain\s*\{[\s\S]*?display:\s*none/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)[\s\S]*?\.hero-video-fallback\s*\{[\s\S]*?animation:\s*none/);
});
