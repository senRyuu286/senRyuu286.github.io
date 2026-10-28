import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Years, statuses, and links are plain text so placeholders like [YEAR] are allowed for now.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    stack: z.array(z.string()),
    year: z.string(),
    status: z.string(),
    tags: z.array(z.string()),
    github: z.string().optional(),
    demo: z.string().optional(),
  }),
});

const certificates = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/certificates' }),
  schema: z.object({
    title: z.string(),
    issuer: z.string(),
    year: z.string(),
    status: z.string(),
    tags: z.array(z.string()),
    credentialUrl: z.string().optional(),
  }),
});

const activities = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/activities' }),
  schema: z.object({
    title: z.string(),
    organization: z.string(),
    role: z.string(),
    year: z.string(),
    status: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { projects, certificates, activities };