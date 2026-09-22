# Homepage feedback refinement

- At >=1600px width and >=850px height, the final orbit scale is 0.88 instead of 0.68, with a larger 1600px / 125vh stage. The final horizontal shift is -20%; centre text scale is 1.2. Existing scatter, gather and orbit timing remain unchanged. Smaller viewports retain their existing geometry.
- Wide-screen story column uses the space to the right of the stage; the orbit can extend slightly into its edge as requested. The centre description has a narrower measure to stay inside the orbit.
- Both pet-name and homepage story accents use the same #f59e0b SVG stroke with inline box-decoration-break: clone. The old homepage inline-block/nowrap/pseudo-element decoration was removed, so each wrapped line gets its own stroke.
- Replaced five rejected props with finer paper artwork generated through built-in image_gen, preserving transparent alpha. Installed in public/wishlist/paper-v2/. Exact prompts and source paths are in home-paper-assets-v2-2026-09-21.json.
- Restored the original photographic cat and box at /wishlist/destination-box.webp. The generated paper cat is no longer referenced.

Verification: browser screenshots at 1920x1080 and 2560x1440 in the final scroll phase; mobile ring and real wrapped story heading at 390px; wishlist at 1440px with all seven images loaded, including the original cat. 24 existing homepage-feedback tests, TypeScript and ESLint passed. A stale generated type file for the previous temporary underline check route was removed before TypeScript validation.
