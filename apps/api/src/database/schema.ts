import {
  boolean,
  check,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const projectPublicationStatus = pgEnum('project_publication_status', [
  'draft',
  'published',
  'archived',
]);
export const experiencePublicationStatus = pgEnum(
  'experience_publication_status',
  ['draft', 'published', 'archived'],
);

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
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('projects_slug_unique').on(table.slug),
    check(
      'projects_display_order_non_negative',
      sql`${table.displayOrder} >= 0`,
    ),
  ],
);

export const experiences = pgTable(
  'experiences',
  {
    id: uuid('id').primaryKey(),
    organization: text('organization').notNull(),
    role: text('role').notNull(),
    summary: text('summary').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    status: experiencePublicationStatus('status').notNull().default('draft'),
    displayOrder: integer('display_order').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      'experiences_display_order_non_negative',
      sql`${table.displayOrder} >= 0`,
    ),
  ],
);
