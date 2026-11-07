/** Site-wide facts in one place. Anything in [BRACKETS] is a placeholder (see file 07). */
interface SiteInfo {
  name: string;
  linkedin: string;
  github: string;
  /** Path of the Open Graph image inside public/, or '' until one exists. */
  ogImage: string;
  /** The id from your Formspree form address: https://formspree.io/f/<this id>. */
  formspreeId: string;
  /** Your GoatCounter site code: https://<this code>.goatcounter.com. */
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

/** True when a value is a real web address and not a placeholder. */
export function isUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}

/** Profile links share the same validity rules across the site. */
export const profileLinks = [
  { key: 'linkedin', label: 'LinkedIn', text: site.linkedin, href: site.linkedin, real: isUrl(site.linkedin), external: true },
  { key: 'github', label: 'GitHub', text: site.github, href: site.github, real: isUrl(site.github), external: true },
];
