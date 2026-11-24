
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../assets/logo.jpg';
import { api } from '../api/client';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/modules', label: 'Modules' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/about', label: 'About' },
  { to: '/settings', label: 'Settings' },
];

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [results, setResults] = useState({ modules: [], announcements: [] });
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const query = search.trim();

    if (!query) {
      setResults({ modules: [], announcements: [] });
      setSearching(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setSearching(true);

      try {
        const [moduleResult, announcementResult] = await Promise.allSettled([
          api.getModules(),
          api.getAnnouncements({ search: query }),
        ]);

        if (cancelled) return;

        let modules = [];
        let announcements = [];

        if (moduleResult.status === 'fulfilled') {
          const data = moduleResult.value;
          const list = Array.isArray(data) ? data : data?.data || [];

          modules = list.filter((m) =>
            `${m.name || ''} ${m.description || ''}`
              .toLowerCase()
              .includes(query.toLowerCase())
          );
        }

        if (announcementResult.status === 'fulfilled') {
          const data = announcementResult.value;
          const list = Array.isArray(data) ? data : data?.data || [];
          announcements = Array.isArray(list) ? list : [];
        }

        setResults({
          modules: modules.slice(0, 5),
          announcements: announcements.slice(0, 5),
        });
      } catch {
        if (!cancelled) {
          setResults({ modules: [], announcements: [] });
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  async function logout() {
    try {
      await api.logout();
    } finally {
      setUser(null);
      navigate('/login');
    }
  }

  const hasResults =
    results.modules.length > 0 || results.announcements.length > 0;

  function openModule() {
    setShowResults(false);
    setSearch('');
    navigate('/modules');
  }

  function openAnnouncement(id) {
    setShowResults(false);
    setSearch('');
    navigate(`/announcements/${id}`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-900 bg-[#07543D] shadow-sm">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">

        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="IDSC logo"
            className="h-11 w-11 rounded-full object-cover"
          />
          <span>
            <span className="block text-sm font-bold tracking-wide text-white">
              IDSC
            </span>
            <span className="block text-xs text-emerald-100">
              College Management System
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full items-center gap-1 overflow-x-auto border-t border-emerald-700 pt-2 sm:order-none sm:w-auto sm:border-0 sm:pt-0"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : 'text-white hover:bg-emerald-700'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="relative order-2 w-full sm:order-none sm:w-56 lg:w-64">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>

            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowResults(false);
                if (e.key === 'Enter' && search.trim()) {
                  setShowResults(true);
                }
              }}
              placeholder="Search modules & announcements..."
              aria-label="Search modules and announcements"
              className="w-full rounded-lg border border-emerald-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {showResults && search.trim() && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-gray-200 bg-white py-2 shadow-xl sm:w-80">

              {searching ? (
                <p className="px-4 py-4 text-center text-sm text-gray-500">
                  Searching...
                </p>
              ) : !hasResults ? (
                <p className="px-4 py-4 text-center text-sm text-gray-500">
                  No matching modules or announcements found.
                </p>
              ) : (
                <>
                  {results.modules.length > 0 && (
                    <div className="mb-2">
                      <p className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
                        Modules
                      </p>

                      {results.modules.map((module) => (
                        <button
                          key={module.id}
                          type="button"
                          onClick={openModule}
                          className="block w-full px-4 py-2 text-left hover:bg-emerald-50"
                        >
                          <span className="block text-sm font-semibold text-gray-800">
                            {module.name}
                          </span>
                          <span className="block truncate text-xs text-gray-500">
                            {module.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.announcements.length > 0 && (
                    <div>
                      <p className="border-t border-gray-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
                        Announcements
                      </p>

                      {results.announcements.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openAnnouncement(item.id)}
                          className="block w-full px-4 py-2 text-left hover:bg-emerald-50"
                        >
                          <span className="block text-sm font-semibold text-gray-800">
                            {item.title}
                          </span>
                          <span className="block truncate text-xs text-gray-500">
                            {item.summary}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <span className="text-xs text-emerald-100">
            Checking session…
          </span>
        ) : user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-emerald-100 sm:inline">
              {user.fullName} · {user.role}
            </span>
            <button
              onClick={logout}
              className="rounded-lg border border-white px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#07543D] hover:bg-emerald-50"
          >
            Login
          </Link>
        )}

      </div>
    </header>
  );
}
