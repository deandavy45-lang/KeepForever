/**
 * Smoke test for the native SQLite repository against real SQLite (Node 22.5+ built-in node:sqlite).
 * Runs migrations with real transactions, exercises memories/albums/books/covers, and relaunches.
 * Usage: npm run test:db
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'keepforever-dbtest-'));
fs.mkdirSync(path.join(outDir, 'data/sqlite'), { recursive: true });
for (const f of ['ids.ts', 'layout.ts', 'sqlite/migrations.ts', 'sqlite/sqliteRepository.ts']) {
  const code = ts.transpileModule(fs.readFileSync(path.join(root, 'src/data', f), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  fs.writeFileSync(path.join(outDir, 'data', f.replace('.ts', '.js')), code);
}
const Module = require('module');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('crypto');
const orig = Module._load;
Module._load = function (req, ...a) {
  if (req === 'expo-crypto') return { randomUUID: () => crypto.randomUUID() };
  if (req === 'expo-file-system') return { Paths: { document: '/tmp' }, Directory: class { get exists() { return false; } delete() {} } };
  return orig.call(this, req, ...a);
};
// Minimal expo-sqlite async API over node:sqlite, with real transactions.
function wrap(db) {
  const norm = (args) => (args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0]) ? [args[0]] : args);
  return {
    execAsync: async (sql) => db.exec(sql),
    runAsync: async (sql, ...args) => db.prepare(sql).run(...norm(args)),
    getFirstAsync: async (sql, ...args) => db.prepare(sql).get(...norm(args)) ?? null,
    getAllAsync: async (sql, ...args) => db.prepare(sql).all(...norm(args)),
    withTransactionAsync: async (fn) => { db.exec('BEGIN'); try { await fn(); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; } },
  };
}
(async () => {
  const file = path.join(outDir, 'test.db');
  const raw = new DatabaseSync(file);
  const { SQLiteRepository } = require(path.join(outDir, 'data/sqlite/sqliteRepository.js'));
  const repo = new SQLiteRepository(wrap(raw));
  await repo.init();
  console.log('journal_mode:', raw.prepare('PRAGMA journal_mode').get().journal_mode, '| foreign_keys:', raw.prepare('PRAGMA foreign_keys').get().foreign_keys, '| user_version:', raw.prepare('PRAGMA user_version').get().user_version);
  const album = await repo.createAlbum('Lake');
  await repo.createMemory({ title: 'Dock', story: 's', occurredOn: '1998-07-14', location: null, photos: [{ uri: 'file:///a.jpg', width: 1, height: 1, mimeType: 'image/jpeg' }] }, album);
  const book = await repo.createBookFromAlbum(album, 'square_8');
  await repo.updateBookCover(book, { subtitle: 'The Davy Family', spineText: 'Davy' });
  const b = await repo.getBook(book);
  console.log('book pages:', b.pages.map((p) => p.layout).join(','), '| subtitle:', b.subtitle, '| stats:', JSON.stringify(await repo.getStats()));
  // second launch on same file: must not re-run migrations or crash
  const repo2 = new SQLiteRepository(wrap(new DatabaseSync(file)));
  await repo2.init();
  console.log('relaunch ok, memories:', (await repo2.listMemories()).length);
  console.log('PASS');
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
