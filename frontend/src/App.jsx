import React, { useContext, useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LogOut, Moon, Sun, User } from 'lucide-react';
import Home from './pages/Home';
import History from './pages/History';
import Success from './pages/Success';
import View from './pages/View';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthContext from './context/AuthContext.jsx';
import LogoMark from './components/LogoMark.jsx';

const AppShell = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('linkvault-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const themeLabel = useMemo(
    () => (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'),
    [theme]
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('linkvault-theme', theme);
  }, [theme]);

  const hideAuthActions = ['/login', '/register', '/forgot-password'].some((path) =>
    location.pathname.startsWith(path)
  ) || location.pathname.startsWith('/reset');

  return (
    <div className="App min-h-screen flex flex-col">
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'toast-card',
          duration: 3000,
          style: {
            background: '#0b1220',
            color: '#f9fafb',
            border: '1px solid rgba(255,255,255,0.08)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#f59e0b',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#f97316',
              secondary: '#fff',
            },
          },
        }}
      />

        <header className="app-topbar">
          <div className="app-topbar__inner">
            <Link to="/" className="app-brand">
              <span className="app-brand__mark" aria-hidden>
                <LogoMark className="h-6 w-6" />
              </span>
              <span>
                <span className="app-brand__name">LinkVault</span>
                <span className="app-brand__tag">Secure links in seconds</span>
              </span>
            </Link>

            <div className="app-topbar__actions">
              {!hideAuthActions && user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 text-sm text-ink-soft">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </div>
                  <button type="button" onClick={logout} className="app-toggle">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : !hideAuthActions ? (
                <Link to="/login" className="app-toggle">
                  <User className="h-4 w-4" />
                  Login
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                className="app-toggle"
                aria-pressed={theme === 'dark'}
                aria-label={themeLabel}
                title={themeLabel}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4" />
                    Light
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    Dark
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/success"
              element={
                <ProtectedRoute>
                  <Success />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view/:id"
              element={<View />}
            />
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
            <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />
            <Route path="/reset/:token" element={user ? <Navigate to="/" replace /> : <ResetPassword />} />
          </Routes>
        </main>

      <footer className="app-footer">
        <div className="app-footer__inner">
          <div className="app-footer__left">
            <span className="app-footer__brand">LinkVault</span>
            <span className="app-footer__text">
              Secure links in seconds
            </span>
          </div>
          <span className="footer-signature">
            Made by <span className="font-display text-ink">Vivek Kumar Chaubey</span>
          </span>
        </div>
      </footer>
      </div>
  );
};

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
