import { isUrl, site } from './site';

/** True for values still written as [PLACEHOLDERS]. */
export function isPlaceholder(value: string): boolean {
  return value.trim().startsWith('[');
}

/** Builds Person structured data from real details only. Anything still a placeholder is left out. */
export function personJsonLd(siteUrl: string): Record<string, unknown> {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    url: siteUrl,
  };
  if (!isPlaceholder(site.name)) data.name = site.name;
  if (!isPlaceholder(site.bioSentence)) data.description = site.bioSentence;
  if (!isPlaceholder(site.school)) data.affiliation = { '@type': 'EducationalOrganization', name: site.school };
  const sameAs = [site.linkedin, site.github].filter((link) => isUrl(link));
  if (sameAs.length > 0) data.sameAs = sameAs;
  return data;
}