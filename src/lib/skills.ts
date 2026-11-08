export interface SkillGroup {
  name: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  { name: 'Languages', items: ['C', 'Python', 'PHP', 'Java', 'JavaScript', 'TypeScript', 'Dart', 'Solidity'] },
  { name: 'Frameworks', items: ['Laravel', 'Angular', 'React', 'Flutter', 'Astro', 'FastAPI'] },
  { name: 'Databases', items: ['MySQL', 'PostgreSQL'] },
];

export const currentlyLearning: string[] = ['[ITEM]'];

export const skillIcons: Record<string, string> = {
  C: 'simple-icons:c',
  Python: 'simple-icons:python',
  PHP: 'simple-icons:php',
  Java: 'simple-icons:openjdk',
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
