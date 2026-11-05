/** Site-wide facts in one place. Anything in [BRACKETS] is a placeholder (see file 07). */
interface SiteInfo {
  name: string;
  /** Where the BSIT degree is studied. Used in the About key-facts sentence. */
  school: string;
  /** Completes the hero headline: "BSIT student building ...". */
  focusArea: string;
  /** One line under the hero headline. Also the Home meta description. */
  bioSentence: string;
  /** Full bio paragraph on the About page. */
  bio: string;
  /** Closing line on Home. */
  availability: string;
  email: string;
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
  school: "University of San Jose Recoletos",
  focusArea: "[MY FOCUS AREA]",
  bioSentence: "I am an Information Technology undergrad deeply curious about how the web works behind the scenes. I spend my time turning coffee into code, constantly learning new frameworks, and building projects to bridge the gap between theory and real-world development.",
  bio: "[MY BIO]",
  availability: "Open to internships",
  email: "justinramas12@outlook.com",
  linkedin: "https://www.linkedin.com/in/justin-ramas/",
  github: "https://github.com/senRyuu286",
  formspreeId: "mzeernja",
  goatcounterCode: "website-portfolio",
  ogImage: "",
};

export const nav = [
  { label: "Work", href: "/work/" },
  { label: "About", href: "/#about" },
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
  { key: 'mail', label: 'Email', text: site.email, href: `mailto:${site.email}`, real: /^[^\s@[\]]+@[^\s@]+\.[^\s@]+$/.test(site.email), external: false },
];
