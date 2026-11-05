// src/lib/education.ts
import { site } from './site';

export interface EducationEntry {
  school: string;
  program: string;
  period: string;
  highlights: string[];
}

/** Shown on Home under "Education". Anything in [BRACKETS] is a placeholder (see file 07). */
export const education: EducationEntry[] = [
  {
    school: site.school,
    program: 'Bachelor of Science in Information Technology',
    period: '[PERIOD]',
    highlights: ['[EDUCATION HIGHLIGHT]'],
  },
];