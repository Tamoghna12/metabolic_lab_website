import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const publications = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/publications" }),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    venue: z.string(),
    year: z.number(),
    abstract: z.string().optional(),
    doi: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.string(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/team" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    title: z.string(),
    bio: z.string(),
    image: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
    linkedin: z.string().optional(),
    qualifications: z.array(z.string()).optional(),
    achievements: z.array(z.string()).optional(),
    researchFocus: z.array(z.string()).optional(),
    order: z.number().optional(),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.string(),
    image: z.string().optional(),
    authors: z.string().optional(),
  }),
});

export const collections = {
  publications,
  projects,
  team,
  news,
};
