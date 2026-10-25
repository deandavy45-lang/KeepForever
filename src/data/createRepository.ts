import { openDatabaseAsync } from 'expo-sqlite';
import type { Repository } from './repository';
import { SQLiteRepository } from './sqlite/sqliteRepository';

/** Native (iOS/Android): on-device SQLite. Metro picks createRepository.web.ts for the browser. */
export async function createRepository(): Promise<Repository> {
  const repo = new SQLiteRepository(await openDatabaseAsync('keepforever.db'));
  await repo.init();
  return repo;
}
