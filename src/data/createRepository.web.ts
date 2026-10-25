import type { Repository } from './repository';
import { WebRepository } from './web/webRepository';

export async function createRepository(): Promise<Repository> {
  const repo = new WebRepository();
  await repo.init();
  return repo;
}
