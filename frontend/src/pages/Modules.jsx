import { useEffect, useState } from 'react';
import { api } from '../api/client';
import ModuleCard from '../components/ModuleCard';

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [liveById, setLiveById] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const list = await api.getModules();
        if (cancelled) return;
        setModules(Array.isArray(list) ? list : list?.data || []);

        // Detect session (does not block the catalog)
        try {
          const me = await api.me();
          if (cancelled) return;
          setUser(me.user);
        } catch {
          if (!cancelled) setUser(null);
        }
      } catch {
        if (!cancelled) {
          setError(
            'Could not load the modules. Check that the backend is running, then refresh this page.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // When logged in, pull live partner data through the gateway
  useEffect(() => {
    if (!user || !modules.length) return;
    let cancelled = false;
    setLiveLoading(true);

    const ids = modules.map((m) => m.id);
    api
      .getModulesLive(ids)
      .then((res) => {
        if (!cancelled) setLiveById(res.modules || {});
      })
      .catch((err) => {
        // Entire batch failed (gateway down) — mark all offline
        if (cancelled) return;
        const offline = {};
        for (const m of modules) {
          offline[m.id] = {
            ok: false,
            online: false,
            moduleId: m.id,
            message: err.body?.message || err.message || 'Partner modules unreachable.',
          };
        }
        setLiveById(offline);
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, modules]);

  if (loading) {
    return (
      <div role="status" className="text-center py-20 text-gray-400">
        Loading modules...
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="ml-3 underline font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold mb-1">College Modules</h1>
          <p className="text-sm text-gray-500">
            {user
              ? 'You are signed in. Live data is loaded from partner modules through the API gateway when available.'
              : 'Sign in to load live information from partner modules (Registrar, Library, Finance, …).'}
          </p>
        </div>
        {user && (
          <span className="text-xs text-gray-500">
            {liveLoading ? 'Refreshing live data…' : 'Live data updated'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((m) => (
          <ModuleCard key={m.id} module={m} live={user ? liveById[m.id] : null} />
        ))}
      </div>
    </div>
  );
}
