import { env } from 'cloudflare:workers';
import { and, desc, eq } from 'drizzle-orm';

import { getDb } from './index';
import {
  applications,
  type Application,
  type ApplicationStatus,
  type NewApplication,
} from './schema';

let schemaReady: Promise<void> | null = null;

export async function ensureDatabase(): Promise<void> {
  if (!schemaReady) {
    schemaReady = env.DB.batch([
      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          company TEXT NOT NULL,
          role TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'applied',
          location TEXT NOT NULL DEFAULT '',
          applied_on TEXT,
          notes TEXT NOT NULL DEFAULT '',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `),
      env.DB.prepare(`
        CREATE INDEX IF NOT EXISTS idx_applications_user_status
        ON applications(user_id, status)
      `),
      env.DB.prepare(`
        CREATE INDEX IF NOT EXISTS idx_applications_user_updated
        ON applications(user_id, updated_at)
      `),
      env.DB.prepare('PRAGMA optimize'),
    ]).then(() => undefined);
  }
  return schemaReady;
}

export async function listApplications(userId: string): Promise<Application[]> {
  await ensureDatabase();
  return getDb()
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.updatedAt));
}

export async function insertApplication(
  application: NewApplication,
): Promise<void> {
  await ensureDatabase();
  await getDb().insert(applications).values(application);
}

export async function setApplicationStatus(
  userId: string,
  id: number,
  status: ApplicationStatus,
): Promise<void> {
  await ensureDatabase();
  await getDb()
    .update(applications)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));
}

export async function removeApplication(
  userId: string,
  id: number,
): Promise<void> {
  await ensureDatabase();
  await getDb()
    .delete(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));
}
