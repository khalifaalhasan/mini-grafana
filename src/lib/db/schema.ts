import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const rcaResults = pgTable('rca_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  logId: text('log_id').notNull(),
  logMessage: text('log_message').notNull(),
  logLabels: jsonb('log_labels').$type<Record<string, string>>().notNull(),
  logTimestamp: timestamp('log_timestamp', { withTimezone: true }).notNull(),
  modelUsed: text('model_used').notNull(),
  rootCause: text('root_cause').notNull(),
  impact: text('impact').notNull(),
  recommendation: text('recommendation').notNull(),
  rawResponse: text('raw_response').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type RcaResult = typeof rcaResults.$inferSelect;
export type NewRcaResult = typeof rcaResults.$inferInsert;
