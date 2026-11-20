import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Integrations() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .getLibraryIntegration()
      .then((data) => setResult(data))
      .catch((err) => {
        setResult(err.body || { ok: false, online: false, message: err.message });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="fade-in max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">Module Integrations</h1>
      <p className="text-sm text-gray-500 mb-6">
        Live call to another group&apos;s Library module through the shared API gateway.
        Offline and misconfiguration cases are handled gracefully.
      </p>

      {loading && (
        <div role="status" className="text-gray-400 py-10">
          Contacting Library module…
        </div>
      )}

      {!loading && result && (
        <div
          className={`rounded-xl border p-6 text-sm ${
            result.ok
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : result.online
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <p className="font-semibold mb-2">
            {result.ok
              ? 'Library module responded successfully'
              : result.online
                ? 'Library module returned an error'
                : 'Library module offline or not configured'}
          </p>
          <p className="mb-3">{result.message || 'OK'}</p>
          {result.data && (
            <pre className="mt-3 overflow-auto rounded-lg bg-white/70 p-3 text-xs text-gray-800">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-white/50"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
