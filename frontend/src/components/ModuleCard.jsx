
const moduleUrls = {
  library: 'https://library-management-ken-864b.vercel.app/',
  faculty: 'https://facultymodule.netlify.app/',
};

export default function ModuleCard({ module, live }) {
  const status = live
    ? live.ok
      ? 'online'
      : live.online
        ? 'error'
        : 'offline'
    : null;

  const statusStyles = {
    online: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    offline: 'bg-red-50 text-red-700 border-red-200',
    error: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  const summaryText = (() => {
    if (!live) return module.description;
    if (live.ok && live.data) {
      if (typeof live.data === 'string') return live.data;
      if (live.data.summary) return live.data.summary;
      if (live.data.message) return live.data.message;

      const keys = Object.keys(live.data).slice(0, 3);
      return keys.map((k) => `${k}: ${JSON.stringify(live.data[k])}`).join(' · ');
    }
    return live.message || module.description;
  })();

  const moduleUrl = moduleUrls[module.id];

  return (
    <article className="module-card rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="font-semibold text-gray-900">{module.name}</h2>

        {status && (
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[status]}`}
          >
            {status}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 line-clamp-3">{summaryText}</p>

      {moduleUrl && (
        <a
          href={moduleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Open {module.name} Module
        </a>
      )}

      {live?.ok && live.data && (
        <details className="mt-3 text-xs text-gray-500">
          <summary className="cursor-pointer select-none">Live payload</summary>
          <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-gray-50 p-2">
            {JSON.stringify(live.data, null, 2)}
          </pre>
        </details>
      )}
    </article>
  );
}
