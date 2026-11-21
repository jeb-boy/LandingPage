
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Modules from './pages/Modules';
import Announcements from './pages/Announcements';
import AnnouncementDetail from './pages/AnnouncementDetail';
import About from './pages/About';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Integrations from './pages/Integrations';
import { api } from './api/client';

export default function App() {
  const location = useLocation();
  const [theme, setTheme] = useState('light');

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/reset-password';

  // Load saved theme
  useEffect(() => {
    let active = true;

    async function loadTheme() {
      try {
        const response = await api.getSettings();

        if (active) {
          setTheme(response.settings.theme || 'light');
        }
      } catch (error) {
        console.error('Could not load saved theme:', error);
      }
    }

    loadTheme();

    return () => {
      active = false;
    };
  }, []);

  // Listen for theme changes from Settings
  useEffect(() => {
    const handleThemeChange = (event) => {
      setTheme(event.detail);
    };

    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  // Apply theme across the application
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && media.matches);

      root.classList.toggle('dark-theme', isDark);
    };

    applyTheme();

    if (theme === 'system') {
      media.addEventListener('change', applyTheme);

      return () => {
        media.removeEventListener('change', applyTheme);
      };
    }
  }, [theme]);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto min-h-[calc(100vh-80px)] max-w-7xl p-4 sm:p-6 lg:px-8 lg:py-7">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/announcements/:id" element={<AnnouncementDetail />} />
          <Route path="/about" element={<About />} />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/integrations"
            element={
              <ProtectedRoute>
                <Integrations />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <div className="rounded-xl bg-white p-8 text-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Page not found
                </h1>
                <p className="mt-2 text-gray-600">
                  The page you are looking for does not exist.
                </p>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
