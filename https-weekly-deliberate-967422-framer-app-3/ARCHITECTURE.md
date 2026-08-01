# Portfolio architecture

This site intentionally stays framework-free so it can run directly from GitHub Pages or a local HTML file.

## Shared content

- `scripts/project-data.js` is the source of truth for project titles, URLs, cover images, categories, and related projects.
- `script.js` defines the shared `site-header`, `site-footer`, `project-card`, and `project-recommendations` components, plus site interactions.
- Individual HTML files contain only page-specific editorial content and lightweight component declarations.

To update a project title, cover, category, URL, or recommendations, edit `scripts/project-data.js` once instead of editing every page.

## Styles

`styles.css` is the stable stylesheet entrypoint used by every page. It imports these files in cascade order:

1. `styles/fonts.css` — local font declarations.
2. `styles/showcase-pages.css` — branded Forma, SheepGuard, and AllerPal presentation systems.
3. `styles/base.css` — tokens, reset, shared shell, navigation, loading, and cursor behavior.
4. `styles/home.css` — homepage sections and shared footer presentation.
5. `styles/about.css` — About page.
6. `styles/listings.css` — Art Works and Product Designs listings.
7. `styles/project-detail.css` — shared case-study layout.
8. `styles/contact.css` — Contact page and CTA.
9. `styles/responsive.css` — motion preferences, mobile rules, and final scoped overrides.

Keep new rules in the narrowest relevant file. Avoid adding page-specific styles back to HTML.

## Assets

Images use responsive WebP variants at 640, 1280, and up to 2400 pixels. `scripts/optimize-assets.cjs` can be used when new PNG or JPEG source artwork is added; review its manifest before publishing because it removes unreferenced source assets after conversion.
