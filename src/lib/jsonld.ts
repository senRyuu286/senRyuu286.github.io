import { isUrl, site } from './site';
import { education } from './education';

export function isPlaceholder(value: string): boolean {
  return value.trim().startsWith('[');
}

export function personJsonLd(siteUrl: string): Record<string, unknown> {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    url: siteUrl,
  };
  if (!isPlaceholder(site.name)) data.name = site.name;
  const school = education.find((entry) => !isPlaceholder(entry.school))?.school;
  if (school) data.affiliation = { '@type': 'EducationalOrganization', name: school };
  const sameAs = [site.linkedin, site.github].filter((link) => isUrl(link));
  if (sameAs.length > 0) data.sameAs = sameAs;
  return data;
}