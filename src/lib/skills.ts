// src/lib/skills.ts
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

/**
 * Logo for a skill, by the exact name used above. "simple-icons:" names come from the Simple Icons set
 * (installed as @iconify-json/simple-icons). Plain names ("java", "hardhat") are our own simple drawings in src/icons/.
 * A skill with no entry here shows as a text-only chip.
 */
export const skillIcons: Record<string, string> = {
  C: 'simple-icons:c',
  Python: 'simple-icons:python',
  PHP: 'simple-icons:php',
  Java: 'java',
  JavaScript: 'simple-icons:javascript',
  TypeScript: 'simple-icons:typescript',
  Dart: 'simple-icons:dart',
  Solidity: 'simple-icons:solidity',
  Laravel: 'simple-icons:laravel',
  Angular: 'simple-icons:angular',
  React: 'simple-icons:react',
  Flutter: 'simple-icons:flutter',
  Astro: 'simple-icons:astro',
  FastAPI: 'simple-icons:fastapi',
  MySQL: 'simple-icons:mysql',
  PostgreSQL: 'simple-icons:postgresql',
  Hardhat: 'hardhat',
};