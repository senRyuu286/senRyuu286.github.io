export interface SkillGroup {
  name: string;
  items: string[];
}

/** Placeholder groups until real ones are supplied. Home and About both read this list. Need to add Hardhat as tool*/
export const skillGroups: SkillGroup[] = [
  { name: 'Languages', items: ['C', 'Python', 'PHP', 'Java', 'JavaScript', 'TypeScript', 'Dart', 'Solidity'] },
  { name: 'Frameworks', items: ['Laravel', 'Angular', 'React', 'Flutter', 'Astro', 'FastAPI'] },
  { name: 'Databases', items: ['MySQL', 'PostgreSQL'] },
];

/** Shown on the About page under "Currently learning". */
export const currentlyLearning: string[] = ['[ITEM]'];