interface SiteInfo {
  name: string;
  linkedin: string;
  github: string;
  ogImage: string;
  formspreeId: string;
  goatcounterCode: string;
}

export const site: SiteInfo = {
  name: "Justin Ramas",
  linkedin: "https://www.linkedin.com/in/justin-ramas/",
  github: "https://github.com/senRyuu286",
  formspreeId: "mzeernja",
  goatcounterCode: "website-portfolio",
  ogImage: "/og-image.png",
};

export const nav = [
  { label: "Works", href: "/#works" },
  { label: "Contact", href: "/#contact" },
];

export function isUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}

export const profileLinks = [
  { key: 'linkedin', label: 'LinkedIn', text: site.linkedin, href: site.linkedin, real: isUrl(site.linkedin), external: true },
  { key: 'github', label: 'GitHub', text: site.github, href: site.github, real: isUrl(site.github), external: true },
];
