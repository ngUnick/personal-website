import { boolean, check, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const projectPublicationStatus = pgEnum('project_publication_status', ['draft', 'published', 'archived']);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    status: projectPublicationStatus('status').notNull().default('draft'),
    featured: boolean('featured').notNull().default(false),
    displayOrder: integer('display_order').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('projects_slug_unique').on(table.slug),
    check('projects_display_order_non_negative', sql`${table.displayOrder} >= 0`),
  ],
);
