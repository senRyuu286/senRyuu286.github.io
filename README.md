# Portfolio

A personal portfolio for a BSIT student: skills, projects, certificates, activities, and a learning journey. It is a static site, so it needs no server.

## Stack

| Part | Choice |
|---|---|
| Framework | Astro 7.4.2 (static output, TypeScript strict) |
| Styling | Tailwind CSS 4.3.3, with design tokens in `src/styles/global.css` |
| Animation | CSS only, with `tw-animate-css` 1.4.0 |
| Sitemap | `@astrojs/sitemap` 3.7.4 |
| Type checks | TypeScript 6.0.3 and `@astrojs/check` 0.9.12 |
| Tests | Playwright 1.64.1 and `@axe-core/playwright` 4.14.0 |
| Fonts | Archivo and Atkinson Hyperlegible Next, self-hosted in `public/fonts/` |
| Services | Formspree (contact form) and GoatCounter (cookie-free analytics) |
| Hosting | GitHub Pages, deployed by GitHub Actions |

## Requirements

- Node 22.23.4 or newer
- pnpm

## Commands

| Command | What it does |
|---|---|
| `pnpm install` | Installs the exact versions in `pnpm-lock.yaml` |
| `pnpm dev` | Starts the dev server at `http://localhost:4321` |
| `pnpm build` | Builds the site into `dist/` |
| `pnpm preview` | Serves the built site |
| `pnpm check` | Type-checks `.astro` and `.ts` files |
| `pnpm test` | Builds, then runs the browser tests (close `pnpm dev` first) |
| `pnpm test:launch` | Launch gate: fails while placeholders or setup gaps remain |

## Project structure

```
.github/workflows/deploy.yml   Build on every push, deploy only from main
public/                        Fonts, favicon, robots.txt, link-preview image
src/components/                Page sections and the five ui/ building blocks
src/content/                   projects/, certificates/, activities/ (one file per item)
src/content.config.ts          Shape of those content files
src/layouts/BaseLayout.astro   Shared page frame, SEO tags, analytics
src/lib/                       Site facts, skills, journey, filter logic, structured data
src/pages/                     One file per page
src/scripts/                   Work page filter and contact form scripts
src/styles/global.css          Tokens, fonts, Tailwind theme
tests/                         Everyday browser tests
launch-tests/                  The launch gate
```

## Editing content

- **Site facts** (name, school, links, service codes): `src/lib/site.ts`
- **Skills and learning journey:** `src/lib/skills.ts` and `src/lib/journey.ts`
- **Work list:** add one file to `src/content/projects/`, `certificates/`, or `activities/`. Copy an existing file and change its fields. Project files are Markdown and become pages at `/work/<file name>/`.
- **Links inside Markdown text** are not opened safely in a new tab automatically. Put external links in the `github` and `demo` fields instead.

Anything written as `[LIKE THIS]` is an unfinished placeholder. `pnpm test:launch` lists every one that is left.

## Testing

`pnpm test` checks the Work filter, the contact form (with Formspree replaced by fake replies), external links, the learning journey list, and accessibility (axe) in light and dark mode.

## Deployment

1. Pushes to any branch run the build job only.
2. Pushes to `main` also run the deploy job, which publishes to GitHub Pages.
3. In the repository settings, Pages must use **GitHub Actions** as its source.

GitHub Actions are pinned to full commit SHAs. Update them on purpose, not automatically.

## Dependencies and security

- Every package is installed with an exact version (`pnpm add -E`). The lockfile is committed, and CI installs from it.
- pnpm's default release-age delay stays on.
- New packages are reviewed on Snyk and Socket.dev before each push, and `pnpm audit` runs before each push.

## Fonts

Archivo and Atkinson Hyperlegible Next are open-licensed (SIL OFL). Their license texts sit next to the font files in `public/fonts/`.