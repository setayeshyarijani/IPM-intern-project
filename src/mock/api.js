import { getDb, saveDb } from './database';

// Every function here mimics a real HTTP call: it resolves after a
// simulated network delay and can reject the same way `fetch` would.
// This is the seam that gets swapped out for real endpoints later —
// everything above this file (hooks, pages) only talks to this API.

const DELAY = 350;

function wait(ms = DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function paginateSortFilter(rows, { page = 1, pageSize = 10, search = '', searchFields = [], sortField, sortOrder }) {
  let data = [...rows];

  if (search && searchFields.length) {
    const q = search.toLowerCase();
    data = data.filter((row) => searchFields.some((f) => String(row[f] ?? '').toLowerCase().includes(q)));
  }

  if (sortField) {
    data.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortOrder === 'descend' ? -cmp : cmp;
    });
  }

  const total = data.length;
  const start = (page - 1) * pageSize;
  const items = data.slice(start, start + pageSize);

  return { items, total, page, pageSize };
}

// ---------- Auth ----------

export async function apiLogin({ email, password }) {
  await wait();
  const db = getDb();
  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    const err = new Error('INVALID_CREDENTIALS');
    throw err;
  }
  if (user.status === 'disabled') {
    const err = new Error('ACCOUNT_DISABLED');
    throw err;
  }
  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

export async function apiRegister({ fullName, email, password }) {
  await wait();
  const db = getDb();
  if (db.users.some((u) => u.email === email)) {
    const err = new Error('EMAIL_EXISTS');
    throw err;
  }
  const newUser = {
    id: uid('u'),
    fullName,
    email,
    password,
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveDb(db);
  const { password: _pw, ...safeUser } = newUser;
  return safeUser;
}

export async function apiUpdateProfile(userId, updates) {
  await wait();
  const db = getDb();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('NOT_FOUND');
  db.users[idx] = { ...db.users[idx], ...updates };
  saveDb(db);
  const { password: _pw, ...safeUser } = db.users[idx];
  return safeUser;
}

// ---------- Users (admin) ----------

export async function apiListUsers(params) {
  await wait();
  const db = getDb();
  const result = paginateSortFilter(db.users, { ...params, searchFields: ['fullName', 'email'] });
  return {
    ...result,
    items: result.items.map(({ password: _pw, ...rest }) => rest),
  };
}

export async function apiSetUserStatus(userId, status) {
  await wait();
  const db = getDb();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('NOT_FOUND');
  db.users[idx].status = status;
  saveDb(db);
  const { password: _pw, ...safeUser } = db.users[idx];
  return safeUser;
}

// ---------- Tickets ----------

export async function apiListTickets(params, { onlyUserId } = {}) {
  await wait();
  const db = getDb();
  let rows = db.tickets;
  if (onlyUserId) {
    rows = rows.filter((t) => t.authorId === onlyUserId);
  }
  return paginateSortFilter(rows, { ...params, searchFields: ['subject', 'authorName'] });
}

export async function apiGetTicket(ticketId) {
  await wait();
  const db = getDb();
  const ticket = db.tickets.find((t) => t.id === ticketId);
  if (!ticket) throw new Error('NOT_FOUND');
  return ticket;
}

export async function apiCreateTicket({ subject, description, priority, authorId, authorName }) {
  await wait();
  const db = getDb();
  const ticket = {
    id: uid('t'),
    subject,
    description,
    status: 'open',
    priority,
    createdAt: new Date().toISOString(),
    authorId,
    authorName,
    messages: [
      {
        id: uid('m'),
        authorId,
        authorName,
        body: description,
        createdAt: new Date().toISOString(),
      },
    ],
  };
  db.tickets.unshift(ticket);
  saveDb(db);
  return ticket;
}

export async function apiReplyTicket(ticketId, { authorId, authorName, body }) {
  await wait();
  const db = getDb();
  const ticket = db.tickets.find((t) => t.id === ticketId);
  if (!ticket) throw new Error('NOT_FOUND');
  ticket.messages.push({ id: uid('m'), authorId, authorName, body, createdAt: new Date().toISOString() });
  saveDb(db);
  return ticket;
}

// src/mock/api.js

// تابع حذف تیکت
export const apiDeleteTicket = (id) => {
  return new Promise((resolve, reject) => {
    // شبیه‌سازی تاخیر شبکه
    setTimeout(() => {
      try {
        // دریافت تیکت‌ها از localStorage یا state
        const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
        
        // پیدا کردن تیکت مورد نظر
        const ticketIndex = tickets.findIndex(t => t.id === id);
        
        if (ticketIndex === -1) {
          reject(new Error('تیکت یافت نشد'));
          return;
        }
        
        // حذف تیکت
        tickets.splice(ticketIndex, 1);
        
        // ذخیره مجدد در localStorage
        localStorage.setItem('tickets', JSON.stringify(tickets));
        
        resolve({ success: true, message: 'تیکت با موفقیت حذف شد' });
      } catch (error) {
        reject(error);
      }
    }, 500); // تاخیر 500 میلی‌ثانیه برای شبیه‌سازی
  });
};

// اگر از دیتابیس mock استفاده می‌کنید
let mockTickets = [
  {
    id: '1',
    subject: 'مشکل در ورود به سیستم',
    status: 'open',
    priority: 'high',
    authorName: 'کاربر ۱',
    createdAt: '2024-01-15T10:30:00',
    description: 'توضیحات تیکت...'
  },
  // ... تیکت‌های دیگر
];

export const apiDeleteTicketV2 = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockTickets.findIndex(t => t.id === id);
      
      if (index === -1) {
        reject({ message: 'تیکت یافت نشد' });
        return;
      }
      
      mockTickets.splice(index, 1);
      resolve({ success: true });
    }, 500);
  });
};

export async function apiSetTicketStatus(ticketId, status) {
  await wait();
  const db = getDb();
  const ticket = db.tickets.find((t) => t.id === ticketId);
  if (!ticket) throw new Error('NOT_FOUND');
  ticket.status = status;
  saveDb(db);
  return ticket;
}

// ---------- Reports ----------

export async function apiGetReports() {
  await wait();
  const db = getDb();
  return {
    totalUsers: db.users.length,
    totalTickets: db.tickets.length,
    openTickets: db.tickets.filter((t) => t.status === 'open').length,
    closedTickets: db.tickets.filter((t) => t.status === 'closed').length,
  };
}
