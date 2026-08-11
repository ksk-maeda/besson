import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/products' }),
  schema: z.object({
    model: z.string(),
    category: z.enum(['bistro', 'lounge', 'bar', 'grand-maison']),
    categoryLabel: z.string(),
    bottles: z.number(),
    price: z.string(),
    priceHasVariants: z.boolean().default(false),
    dimensions: z.string(),
    weightKg: z.number(),
    tempRange: z.string(),
    tempZones: z.string(),
    heating: z.boolean(),
    powerW: z.number(),
    annualCostYen: z.string(),
    shelfMaterial: z.string(),
    doorType: z.string(),
    interiorLight: z.boolean(),
    sku: z.string().nullable(),
    shelfConfig: z.string().nullable(),
    bundledItems: z.string().nullable(),
    warrantyYears: z.number().default(1),
    headline: z.string(),
    headlineIsDraft: z.boolean().default(false),
    fitFor: z.array(z.string()).default([]),
    highlights: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  }),
});

export const collections = { products };
