# Tech Rosetta

Tech-literacy book series and publishing site. No site code exists yet. Build
everything below in from the first page.

- Domains: techrosetta.com, techrosetta.co
- Repo: github.com/bonnieDev/techRosetta (public, so keep the manuscript out
  unless Bonnie decides otherwise)
- GA4 measurement ID: G-9LD7RGL2R7
- Stack: Next.js on Vercel, Supabase for the database and login, plain CSS.
  GitHub holds the code, and pushing `main` deploys. Use Vercel's country header
  for the consent banner. Secrets stay in Vercel's environment variables, never
  in the public repo.
- English is the source of truth. Everything else derives from it.

## International visibility: tags

**URLs**
- One subfolder per language: `/es/`, `/pt-br/`, `/pt-pt/`, `/ar/`, `/zh-hans/`.
  English lives at `/en/`, and `/` is the `x-default` language chooser or
  English landing page.
- Never redirect by IP or browser language. Crawlers and travelers would miss
  editions.

**In every page's `<head>`**
- `<html lang="…" dir="ltr|rtl">`, and `lang` on any inline foreign text.
- `hreflang` links to every published language of the page, including itself,
  plus `x-default`. Absolute URLs, and every page must link back to the others.
- A canonical URL pointing at the page's own language, never at English.
- Translated `<title>` and meta description.
- `og:locale` (`pt_BR`, with an underscore) and `og:locale:alternate`.
- A per-language social image generated from live text, since a baked-in
  English image defeats the translation.
- JSON-LD `Book` on volume pages: `inLanguage`, `bookEdition`, `isbn` when one
  exists, `translationOfWork` linking to the English edition.

**Indexing**
- Only approved translations are indexed and listed in `hreflang` and the
  sitemap. `machine_draft` and `needs_review` pages get `noindex`.
- A stale page that still shows its approved translation stays indexed.
- `sitemap.xml` carries the `hreflang` alternates and is generated from the
  database.
- Add `lang_code` to anything search or the sitemap reads, so a language is
  published by data, not code.

**Fonts and assets**
- Self-host fonts, never Google Fonts. Google's servers are blocked in mainland
  China and raise a consent issue in the EU.
- Load only the current language's font files.

## International visibility: banners

All banner text goes through the same translation pipeline as the book, so
interface strings need their own source table with stable keys. Every banner
is a landmark region with real buttons, works by keyboard, does not trap
focus, and does not cover the focused element (WCAG 2.4.11).

| Banner | Shows when | Behavior |
|---|---|---|
| Consent | Visitor is in a region that requires it (EU, EEA, UK, Brazil; attorney to confirm) | Non-modal. Accept and Reject are equal in size and weight. GA stays off until Accept, using Google Consent Mode. A footer link reopens the choice |
| Language suggestion | Browser language differs from the page and an approved edition exists | Written in the suggested language. Links to the same page in that language. Dismissal is remembered. Never redirects |
| Translation status | The approved text is behind the current English | Says the translation is being updated and links to the English. Lives in the page flow, not floating |
| Language not available | Edition has no approved translation yet | Says so in plain words and shows the available languages |

**Language switcher:** each language named in its own language and script
(Español, العربية, 简体中文). No flags. Portuguese is labeled by region.
Switching keeps the reader on the same page.

## Analytics

Follow the `site-tagging-wcag` skill. One `track()` helper, nothing else calls
gtag. Nothing a visitor types, ever. Bloom signals never go to analytics.

Planned events: `ui_click`, `section_view`, `page_exit`, `chapter_open`,
`language_switch`, `contributor_signup`, `suggestion_submit`, `vote_cast`,
`book_buy_click`.

Parameters: `part`, `section`, `control`, `last_section`, `volume`, `chapter`,
`content_language`, `previous_language`, `translation_status`, `block_key`
(dimensions); `order`, `sections_seen`, `seconds_on_page` (metrics). Don't use
`language`: GA already collects it as the browser language.

Known gap: GA is unreliable in mainland China, so Simplified Chinese readers
there will be undercounted. Don't read that as low demand.

## Known gaps

- Consent regions and banner wording need attorney review.
- Contributor rights agreement needs an attorney before the first contribution
  is accepted.
- KDP terms for a free full web edition need checking. No KDP Select.
- Bloom needs testing on right-to-left pages.
