/** Site-wide facts in one place. Anything in [BRACKETS] is a placeholder (see file 07). */
interface SiteInfo {
  name: string;
  /** Completes the hero headline: "BSIT student building ...". */
  focusArea: string;
  /** One line under the hero headline. Also the Home meta description. */
  bioSentence: string;
  /** Closing line on Home. */
  availability: string;
  email: string;
  linkedin: string;
  github: string;
  /** Path of the Open Graph image inside public/, or '' until one exists. */
  ogImage: string;
}

export const site: SiteInfo = {
  name: '[MY NAME]',
  focusArea: '[MY FOCUS AREA]',
  bioSentence: '[MY BIO SENTENCE]',
  availability: '[CONFIRM: availability, for example open to internships]',
  email: '[MY EMAIL]',
  linkedin: '[LINKEDIN LINK]',
  github: '[GITHUB LINK]',
  ogImage: '',
};

export const nav = [
  { label: 'Work', href: '/work/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

/** True when a value is a real web address and not a placeholder. */
export function isUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}