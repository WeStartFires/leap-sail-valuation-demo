# Fonts, self-hosted on purpose

The two Sail brand faces, both variable, latin subset, both under the SIL Open Font License 1.1
which permits redistribution:

- `quicksand-latin-var.woff2` — Quicksand. The Sail body face, the same one `app/web/src/index.scss`
  loads across the product.
- `roboto-slab-latin-var.woff2` — Roboto Slab. Headings, as on the marketing site and the valuation
  report (`MarketingPage.tsx`, `ValuationReport.tsx`).

They are committed rather than linked to Google Fonts for two reasons. This deck gets opened by
people sitting behind a corporate network, and a cover slide falling back to Arial because
`fonts.gstatic.com` is blocked is a bad first impression nobody would ever tell us about. Second, it
takes a third-party request out of a document we hand to a legal software business.

Refresh them by reading the `@font-face` blocks out of the Google CSS for the same families and
re-downloading the latin `woff2` each one points at. Both are variable, so one file covers every
weight we use.
