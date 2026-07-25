# Intern Support System

Frontend-only support system built for the internship's first milestone:
React + Ant Design, Persian/English support, and a mock backend so the UI
can be built and tested without a real API.

## Stack
- React 18 + Vite
- Ant Design 5 (RTL-aware via `ConfigProvider`)
- react-router-dom v6
- react-i18next (fa / en)
- A mock backend in `src/mock/` — persists to `localStorage`, simulates
  network delay, and supports server-side pagination/search/sort exactly
  like a real API would.

## Getting started
```bash
npm install
npm run dev
```
Then open the printed local URL.

## Login
Two ways in:
- Register a new account from the Register page (becomes a regular user).
- Use the seeded admin account: `admin@example.com` / `admin123`.

## Project structure
```
src/
  i18n/            fa.json / en.json + i18next setup
  mock/            fake database + API functions (the "backend")
  context/         AuthContext (session), LocaleContext (fa/en + RTL)
  components/      DataTable — reusable paginated/searchable/sortable table
  layouts/         AuthLayout (login/register), AppLayout (sidebar + header)
  routes/          route guards (RequireAuth, RequireAdmin, RequireGuest)
  pages/
    Login, Register, Dashboard, Profile
    tickets/       list, detail (with replies), new ticket
    admin/         users management, reports/stats
```

## How the mock backend works
Every "API" call in `src/mock/api.js` is `async`, adds an artificial
delay, and only returns the slice of data the caller asked for — the
same contract a real paginated endpoint would have. Swapping in a real
backend later means replacing the contents of `api.js` with real
`fetch` calls; nothing above that layer needs to change.

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
