// In-memory + localStorage-backed mock database.
// Stands in for a real backend so the frontend can be built and tested
// independently of the actual API.

const DB_KEY = 'mock_db_v1';

function seed() {
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

  for (let i = 1; i <= 47; i++) {
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
  for (let i = 1; i <= 63; i++) {
    const author = users[1 + (i % (users.length - 1))];
    tickets.push({
      id: `t-${i}`,
      subject: subjects[i % subjects.length] + ` #${i}`,
      description: 'Detailed description of the issue goes here. This is sample seed data for the mock backend.',
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

function load() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through to reseed
    }
  }
  const fresh = seed();
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  return fresh;
}

function persist(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getDb() {
  return load();
}

export function saveDb(db) {
  persist(db);
}

export function resetDb() {
  const fresh = seed();
  persist(fresh);
  return fresh;
}
