import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../assets/logo.jpg';
import { api } from '../api/client';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/modules', label: 'Modules' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/integrations', label: 'Integrations' },
  { to: '/about', label: 'About' },
  { to: '/settings', label: 'Settings' },
];

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    try {
      await api.logout();
    } finally {
      setUser(null);
      navigate('/login');
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white shadow-sm">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="IDSC logo" className="h-11 w-11 rounded-full object-cover" />
          <span>
            <span className="block text-sm font-bold tracking-wide text-emerald-950">IDSC</span>
            <span className="block text-xs text-gray-500">College Management System</span>
          </span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full items-center gap-1 overflow-x-auto border-t border-gray-100 pt-2 sm:order-none sm:w-auto sm:border-0 sm:pt-0"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-700 text-white'
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        {loading ? (
          <span className="text-xs text-gray-400">Checking session…</span>
        ) : user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-gray-500 sm:inline">
              {user.fullName} · {user.role}
            </span>
            <button
              onClick={logout}
              className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-800"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
