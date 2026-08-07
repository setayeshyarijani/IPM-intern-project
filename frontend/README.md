# Intern Support System

Frontend app for the internship support system.

The project now has two top-level parts:

- `frontend/` - the React + Vite UI
- `backend/` - a small standalone HTTP API on its own port

## Stack
- React 18 + Vite
- Ant Design 5 (RTL-aware via `ConfigProvider`)
- react-router-dom v6
- react-i18next (fa / en)
- A standalone backend server in `../backend/` that serves auth, users,
  tickets, and reports over HTTP.

## Getting started
```bash
npm install
npm run dev
```
Then open the printed local URL.

To start the backend in a second terminal:
```bash
npm run dev:backend
```

## Login
Two ways in:
- Register a new account from the Register page (becomes a regular user).
- Use the seeded admin account: `admin@example.com` / `admin123`.

## Project structure
```
src/
  i18n/            fa.json / en.json + i18next setup
  api/             HTTP client for the backend
  mock/            legacy local mock data helpers
  context/         AuthContext (session), LocaleContext (fa/en + RTL)
  components/      DataTable — reusable paginated/searchable/sortable table
  layouts/         AuthLayout (login/register), AppLayout (sidebar + header)
  routes/          route guards (RequireAuth, RequireAdmin, RequireGuest)
  pages/
    Login, Register, Dashboard, Profile
    tickets/       list, detail (with replies), new ticket
    admin/         users management, reports/stats
```

## Backend
The backend is a standalone Node HTTP server that listens on port 4000
by default. The frontend talks to it through `src/api/client.js`.

If you want to point the UI at another backend URL, set
`VITE_API_BASE_URL` before running the frontend.

## Tables
`src/components/DataTable.jsx` is the single implementation used by
both the Users table and the Tickets table. It:
- fetches only the current page (no client-side pagination over a full array)
- debounced-free search box wired to server-side filtering
- sortable columns (`sorter: true` on a column triggers a server-side sort)
- shows loading, error (with retry), and empty states

## Next steps (per the internship plan)
This milestone intentionally stops at a complete, working frontend
against the mock backend. Later stages (per the program) will connect
this to the real backend once its infrastructure is ready.
