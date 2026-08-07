import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, 'data', 'db.json');

function seedDb() {
  const firstNames = ['Sara', 'Ali', 'Maryam', 'Reza', 'Niloofar', 'Amir', 'Fatemeh', 'Hossein', 'Zahra', 'Mohammad', 'Elham', 'Kian', 'Parisa', 'Omid', 'Leila', 'Arash'];
  const lastNames = ['Ahmadi', 'Karimi', 'Hosseini', 'Moradi', 'Jafari', 'Rezaei', 'Sadeghi', 'Ghasemi', 'Rostami', 'Bagheri'];

  const users = [
    {
      id: 'u-admin',
      fullName: 'System Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      createdAt: '2025-01-10T08:00:00.000Z',
    },
  ];

  for (let i = 1; i <= 47; i += 1) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    users.push({
      id: `u-${i}`,
      fullName: `${fn} ${ln}`,
      email: `user${i}@example.com`,
      password: 'password123',
      role: 'user',
      status: i % 11 === 0 ? 'disabled' : 'active',
      createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    });
  }

  const subjects = [
    'Cannot reset my password',
    'Dashboard not loading',
    'Question about billing',
    'Feature request: dark mode',
    'Bug in profile page',
    'Unable to upload avatar',
    'Ticket status not updating',
    'Slow page load times',
    'Need to change my email',
    'Export data as CSV',
  ];
  const statuses = ['open', 'inProgress', 'closed'];
  const priorities = ['low', 'medium', 'high'];

  const tickets = [];
  for (let i = 1; i <= 63; i += 1) {
    const author = users[1 + (i % (users.length - 1))];
    tickets.push({
      id: `t-${i}`,
      subject: `${subjects[i % subjects.length]} #${i}`,
      description: 'Detailed description of the issue goes here. This is sample seed data for the backend.',
      status: statuses[i % statuses.length],
      priority: priorities[i % priorities.length],
      createdAt: new Date(Date.now() - i * 43200000).toISOString(),
      authorId: author.id,
      authorName: author.fullName,
      messages: [
        {
          id: `m-${i}-1`,
          authorId: author.id,
          authorName: author.fullName,
          body: 'This is the original ticket message describing the problem.',
          createdAt: new Date(Date.now() - i * 43200000).toISOString(),
        },
      ],
    });
  }

  return { users, tickets };
}

async function ensureDbFile() {
  if (!existsSync(dbFile)) {
    await mkdir(dirname(dbFile), { recursive: true });
    await writeFile(dbFile, JSON.stringify(seedDb(), null, 2), 'utf8');
  }
}

export async function loadDb() {
  await ensureDbFile();
  const raw = await readFile(dbFile, 'utf8');
  return JSON.parse(raw);
}

export async function saveDb(db) {
  await mkdir(dirname(dbFile), { recursive: true });
  await writeFile(dbFile, JSON.stringify(db, null, 2), 'utf8');
}

export async function resetDb() {
  const fresh = seedDb();
  await saveDb(fresh);
  return fresh;
}

export function createSeedDb() {
  return seedDb();
}
