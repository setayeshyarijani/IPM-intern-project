import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeModeProvider } from './context/ThemeModeContext';
import { LocaleProvider } from './context/LocaleContext';
import { RequireAuth, RequireAdmin, RequireGuest } from './routes/guards';

import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import TicketsListPage from './pages/tickets/TicketsListPage';
import NewTicketPage from './pages/tickets/NewTicketPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import UsersPage from './pages/admin/UsersPage';
import ReportsPage from './pages/admin/ReportsPage';

export default function App() {
  return (
    <AuthProvider>
      <ThemeModeProvider>
        <LocaleProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<RequireGuest />}>
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>
              </Route>

              <Route element={<RequireAuth />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/tickets" element={<TicketsListPage />} />
                  <Route path="/tickets/new" element={<NewTicketPage />} />
                  <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />

                  <Route element={<RequireAdmin />}>
                    <Route path="/admin/users" element={<UsersPage />} />
                    <Route path="/admin/reports" element={<ReportsPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </LocaleProvider>
      </ThemeModeProvider>
    </AuthProvider>
  );
}
