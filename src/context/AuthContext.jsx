import { createContext, useContext, useEffect, useState } from 'react';
import { apiLogin, apiRegister, apiUpdateProfile } from '../mock/api';

const AuthContext = createContext(null);
const SESSION_KEY = 'mock_session_v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  async function login(email, password) {
    const loggedInUser = await apiLogin({ email, password });
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(fullName, email, password) {
    const newUser = await apiRegister({ fullName, email, password });
    setUser(newUser);
    return newUser;
  }

  function logout() {
    setUser(null);
  }

  async function updateProfile(updates) {
    const updated = await apiUpdateProfile(user.id, updates);
    setUser(updated);
    return updated;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
