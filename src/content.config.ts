import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Years, statuses, and links are plain text so placeholders like [YEAR] are allowed for now.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    role: z.string().optional(),
    summary: z.string(),
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
    credlyBadgeId: z.uuid().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

const activities = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/activities' }),
  schema: z.object({
    title: z.string(),
    organization: z.string(),
    role: z.string(),
    year: z.string().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()),
    achievement: z.string().optional(),
    date: z.string().optional(),
    location: z.string().optional(),
    collaborators: z.string().optional(),
    takeaway: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    link: z.string().optional(),
    images: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
    })).optional(),
  }),
});

export const collections = { projects, certificates, activities };
