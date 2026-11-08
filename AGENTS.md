## Development

This is a static Astro portfolio. The main pages are `src/pages/index.astro`
and `src/pages/work/index.astro`; `src/pages/work/[slug].astro` generates
project detail pages from Markdown content. `src/layouts/BaseLayout.astro`
owns the shared page shell. Reusable Astro components are in `src/components`,
site data and helpers are in `src/lib`, progressive enhancements are in
`src/scripts`, and shared styles are in `src/styles`.

Content collections are defined in `src/content.config.ts`: projects use
Markdown, certificates and activities use JSON. Keep factual content honest
and leave unresolved details as visible placeholders. The context documents
in `C:\GitHub-Local-Repository\portfolio\Claude Context` record project
intent and decisions; verify claims against the current code.

Use the existing pnpm lockfile and dependencies. Preserve keyboard access,
reduced-motion support, and readable content without JavaScript. External web
links open in a new tab with `rel="noopener noreferrer"`. Run the relevant
checks for changes and report what actually ran.

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
