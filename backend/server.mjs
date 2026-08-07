import { createServer } from 'node:http';
import { loadDb, saveDb } from './data.mjs';

const PORT = Number(process.env.PORT || 4000);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function attachCors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function paginateSortFilter(rows, { page = 1, pageSize = 10, search = '', searchFields = [], sortField, sortOrder }) {
  let data = [...rows];

  if (search && searchFields.length) {
    const q = search.toLowerCase();
    data = data.filter((row) => searchFields.some((field) => String(row[field] ?? '').toLowerCase().includes(q)));
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

function safeUser(user) {
  const { password: _password, ...rest } = user;
  return rest;
}

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }
  if (!body) return {};
  return JSON.parse(body);
}

function notFound(res) {
  sendJson(res, 404, { error: 'NOT_FOUND' });
}

function badRequest(res, error = 'BAD_REQUEST') {
  sendJson(res, 400, { error });
}

async function handleAuthLogin(res, body) {
  const db = await loadDb();
  const user = db.users.find((item) => item.email === body.email && item.password === body.password);
  if (!user) return sendJson(res, 401, { error: 'INVALID_CREDENTIALS' });
  if (user.status === 'disabled') return sendJson(res, 403, { error: 'ACCOUNT_DISABLED' });
  return sendJson(res, 200, safeUser(user));
}

async function handleAuthRegister(res, body) {
  const db = await loadDb();
  if (db.users.some((item) => item.email === body.email)) {
    return sendJson(res, 409, { error: 'EMAIL_EXISTS' });
  }

  const newUser = {
    id: uid('u'),
    fullName: body.fullName,
    email: body.email,
    password: body.password,
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  await saveDb(db);
  return sendJson(res, 201, safeUser(newUser));
}

async function handleUpdateProfile(res, userId, body) {
  const db = await loadDb();
  const index = db.users.findIndex((item) => item.id === userId);
  if (index === -1) return notFound(res);
  db.users[index] = { ...db.users[index], ...(body.updates || {}) };
  await saveDb(db);
  return sendJson(res, 200, safeUser(db.users[index]));
}

async function handleListUsers(res, url) {
  const db = await loadDb();
  const page = Number(url.searchParams.get('page') || 1);
  const pageSize = Number(url.searchParams.get('pageSize') || 10);
  const search = url.searchParams.get('search') || '';
  const sortField = url.searchParams.get('sortField') || undefined;
  const sortOrder = url.searchParams.get('sortOrder') || undefined;
  const result = paginateSortFilter(db.users, {
    page,
    pageSize,
    search,
    sortField,
    sortOrder,
    searchFields: ['fullName', 'email'],
  });

  return sendJson(res, 200, {
    ...result,
    items: result.items.map(safeUser),
  });
}

async function handleSetUserStatus(res, userId, body) {
  const db = await loadDb();
  const index = db.users.findIndex((item) => item.id === userId);
  if (index === -1) return notFound(res);
  db.users[index].status = body.status;
  await saveDb(db);
  return sendJson(res, 200, safeUser(db.users[index]));
}

async function handleListTickets(res, url) {
  const db = await loadDb();
  const page = Number(url.searchParams.get('page') || 1);
  const pageSize = Number(url.searchParams.get('pageSize') || 10);
  const search = url.searchParams.get('search') || '';
  const sortField = url.searchParams.get('sortField') || undefined;
  const sortOrder = url.searchParams.get('sortOrder') || undefined;
  const onlyUserId = url.searchParams.get('onlyUserId') || '';
  const status = url.searchParams.get('status') || '';
  const priority = url.searchParams.get('priority') || '';

  let rows = db.tickets;
  if (onlyUserId) {
    rows = rows.filter((ticket) => ticket.authorId === onlyUserId);
  }
  if (status) {
    rows = rows.filter((ticket) => ticket.status === status);
  }
  if (priority) {
    rows = rows.filter((ticket) => ticket.priority === priority);
  }

  const result = paginateSortFilter(rows, {
    page,
    pageSize,
    search,
    sortField,
    sortOrder,
    searchFields: ['subject', 'authorName'],
  });

  return sendJson(res, 200, result);
}

async function handleGetTicket(res, ticketId) {
  const db = await loadDb();
  const ticket = db.tickets.find((item) => item.id === ticketId);
  if (!ticket) return notFound(res);
  return sendJson(res, 200, ticket);
}

async function handleCreateTicket(res, body) {
  const db = await loadDb();
  const ticket = {
    id: uid('t'),
    subject: body.subject,
    description: body.description,
    status: 'open',
    priority: body.priority,
    createdAt: new Date().toISOString(),
    authorId: body.authorId,
    authorName: body.authorName,
    messages: [
      {
        id: uid('m'),
        authorId: body.authorId,
        authorName: body.authorName,
        body: body.description,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  db.tickets.unshift(ticket);
  await saveDb(db);
  return sendJson(res, 201, ticket);
}

async function handleReplyTicket(res, ticketId, body) {
  const db = await loadDb();
  const ticket = db.tickets.find((item) => item.id === ticketId);
  if (!ticket) return notFound(res);
  ticket.messages.push({
    id: uid('m'),
    authorId: body.authorId,
    authorName: body.authorName,
    body: body.body,
    createdAt: new Date().toISOString(),
  });
  await saveDb(db);
  return sendJson(res, 200, ticket);
}

async function handleSetTicketStatus(res, ticketId, body) {
  const db = await loadDb();
  const ticket = db.tickets.find((item) => item.id === ticketId);
  if (!ticket) return notFound(res);
  ticket.status = body.status;
  await saveDb(db);
  return sendJson(res, 200, ticket);
}

async function handleDeleteTicket(res, ticketId) {
  const db = await loadDb();
  const index = db.tickets.findIndex((item) => item.id === ticketId);
  if (index === -1) return notFound(res);
  db.tickets.splice(index, 1);
  await saveDb(db);
  return sendJson(res, 200, { success: true, message: 'TICKET_DELETED' });
}

async function handleReports(res) {
  const db = await loadDb();
  return sendJson(res, 200, {
    totalUsers: db.users.length,
    totalTickets: db.tickets.length,
    openTickets: db.tickets.filter((ticket) => ticket.status === 'open').length,
    closedTickets: db.tickets.filter((ticket) => ticket.status === 'closed').length,
  });
}

const server = createServer(async (req, res) => {
  attachCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/auth/login') {
      await handleAuthLogin(res, await readJsonBody(req));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/auth/register') {
      await handleAuthRegister(res, await readJsonBody(req));
      return;
    }

    if (req.method === 'PUT' && url.pathname.startsWith('/auth/profile/')) {
      const userId = url.pathname.split('/').pop();
      await handleUpdateProfile(res, userId, await readJsonBody(req));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/users') {
      await handleListUsers(res, url);
      return;
    }

    if (req.method === 'PATCH' && url.pathname.match(/^\/users\/[^/]+\/status$/)) {
      const userId = url.pathname.split('/')[2];
      await handleSetUserStatus(res, userId, await readJsonBody(req));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/tickets') {
      await handleListTickets(res, url);
      return;
    }

    if (req.method === 'GET' && url.pathname.match(/^\/tickets\/[^/]+$/)) {
      const ticketId = url.pathname.split('/')[2];
      await handleGetTicket(res, ticketId);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/tickets') {
      await handleCreateTicket(res, await readJsonBody(req));
      return;
    }

    if (req.method === 'POST' && url.pathname.match(/^\/tickets\/[^/]+\/replies$/)) {
      const ticketId = url.pathname.split('/')[2];
      await handleReplyTicket(res, ticketId, await readJsonBody(req));
      return;
    }

    if (req.method === 'PATCH' && url.pathname.match(/^\/tickets\/[^/]+\/status$/)) {
      const ticketId = url.pathname.split('/')[2];
      await handleSetTicketStatus(res, ticketId, await readJsonBody(req));
      return;
    }

    if (req.method === 'DELETE' && url.pathname.match(/^\/tickets\/[^/]+$/)) {
      const ticketId = url.pathname.split('/')[2];
      await handleDeleteTicket(res, ticketId);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/reports') {
      await handleReports(res);
      return;
    }

    notFound(res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: 'INTERNAL_SERVER_ERROR' });
  }
});

server.listen(PORT, () => {
  console.log(`Backend API listening on http://localhost:${PORT}`);
});
