import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const applicationStatuses = [
  'saved',
  'applied',
  'interviewing',
  'offered',
  'rejected',
  'withdrawn',
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export const applications = sqliteTable(
  'applications',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull(),
    company: text('company').notNull(),
    role: text('role').notNull(),
    status: text('status', { enum: applicationStatuses })
      .notNull()
      .default('applied'),
    location: text('location').notNull().default(''),
    appliedOn: text('applied_on'),
    notes: text('notes').notNull().default(''),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('idx_applications_user_status').on(table.userId, table.status),
    index('idx_applications_user_updated').on(table.userId, table.updatedAt),
  ],
);

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
