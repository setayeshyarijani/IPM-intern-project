const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(path, API_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || payload.message || 'REQUEST_FAILED');
  }

  return payload;
}

export async function apiLogin({ email, password }) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}

export async function apiRegister({ fullName, email, password }) {
  return request('/auth/register', { method: 'POST', body: { fullName, email, password } });
}

export async function apiUpdateProfile(userId, updates) {
  return request(`/auth/profile/${userId}`, { method: 'PUT', body: { updates } });
}

export async function apiListUsers(params) {
  return request('/users', { params });
}

export async function apiSetUserStatus(userId, status) {
  return request(`/users/${userId}/status`, { method: 'PATCH', body: { status } });
}

export async function apiListTickets(params, { onlyUserId } = {}) {
  return request('/tickets', { params: { ...params, onlyUserId } });
}

export async function apiGetTicket(ticketId) {
  return request(`/tickets/${ticketId}`);
}

export async function apiCreateTicket({ subject, description, priority, authorId, authorName }) {
  return request('/tickets', {
    method: 'POST',
    body: { subject, description, priority, authorId, authorName },
  });
}

export async function apiReplyTicket(ticketId, { authorId, authorName, body }) {
  return request(`/tickets/${ticketId}/replies`, {
    method: 'POST',
    body: { authorId, authorName, body },
  });
}

export async function apiSetTicketStatus(ticketId, status) {
  return request(`/tickets/${ticketId}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function apiDeleteTicket(id) {
  return request(`/tickets/${id}`, { method: 'DELETE' });
}

export const apiDeleteTicketV2 = apiDeleteTicket;

export async function apiGetReports() {
  return request('/reports');
}
