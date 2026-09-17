<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Interaction and visual rules confirmed by the project owner

- In-page navigation CTAs (for example «Смотреть питомцев») must always scroll smoothly. Use shared Lenis anchor handling on desktop and native smooth scrolling on touch devices. Respect `prefers-reduced-motion` with immediate scrolling. Verify actual intermediate scroll positions in a browser, not only CSS declarations.
- Check spacing as a system: equal section padding above and below, consistent gaps between controls, cards and pagination. Do not reserve empty feedback rows that create unexplained whitespace.
- Mobile filters should be compact by default, with additional controls behind an accessible disclosure. Preserve values and show active filters on the trigger.
- Preserve hover, keyboard focus and pressed feedback without changing button width. Review 320/390 px, tablet, laptop and large desktop, including expanded controls and quiz states.
- Rounded footer corners must continue the actual preceding section background. Match the page root, html/body and reserved scrollbar gutter; never leave a contrasting rectangular strip visible through the corners. Check a browser crop of the section/footer junction at mobile, tablet and desktop after every page redesign, including routes with missing final content.
- Pet photo galleries use Swiper. Overlay opening AND closing and donation form state changes use Framer Motion, with reduced-motion support. Keep native modal focus trapping, Escape and focus return until the exit animation finishes.
