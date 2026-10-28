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
  name: "[MY NAME]",
  school: "[MY SCHOOL]",
  focusArea: "[MY FOCUS AREA]",
  bioSentence: "[MY BIO SENTENCE]",
  bio: "[MY BIO]",
  availability: "[CONFIRM: availability, for example open to internships]",
  email: "[MY EMAIL]",
  linkedin: "[LINKEDIN LINK]",
  github: "[GITHUB LINK]",
  formspreeId: "mzeernja",
  goatcounterCode: "website-portfolio",
  ogImage: "",
};

export const nav = [
  { label: "Work", href: "/work/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

/** True when a value is a real web address and not a placeholder. */
export function isUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}
