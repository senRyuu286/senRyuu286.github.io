export interface SkillGroup {
  name: string;
  items: string[];
}

/** Placeholder groups until real ones are supplied. Home and About both read this list. */
export const skillGroups: SkillGroup[] = [
  { name: '[SKILL GROUP 1]', items: ['[SKILL]', '[SKILL]', '[SKILL]'] },
  { name: '[SKILL GROUP 2]', items: ['[SKILL]', '[SKILL]', '[SKILL]'] },
  { name: '[SKILL GROUP 3]', items: ['[SKILL]', '[SKILL]', '[SKILL]'] },
];

/** Shown on the About page under "Currently learning". */
export const currentlyLearning: string[] = ['[ITEM]'];