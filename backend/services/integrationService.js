/**
 * Cross-module integration via the agreed API gateway.
 *
 * Set GATEWAY_URL to the shared gateway base (e.g. https://gateway.example.com).
 * Optional per-module path overrides:
 *   GATEWAY_LIBRARY_PATH=/api/v1/library/summary
 *   GATEWAY_REGISTRAR_PATH=/api/v1/registrar/me
 *   GATEWAY_FINANCE_PATH=/api/v1/finance/summary
 *   ...
 *
 * When a partner is offline or misconfigured, a structured response is returned
 * so the UI can show a friendly offline state instead of crashing.
 */

const DEFAULT_TIMEOUT_MS = 5000;

/** Default gateway paths relative to GATEWAY_URL for each module id */
const DEFAULT_PATHS = {
  library: '/api/v1/library/summary',
  registrar: '/api/v1/registrar/me',
  'student-portal': '/api/v1/student/summary',
  finance: '/api/v1/finance/summary',
  faculty: '/api/v1/faculty/summary',
  clinic: '/api/v1/clinic/summary',
  inventory: '/api/v1/inventory/summary',
};

function pathFor(moduleId) {
  const envKey = `GATEWAY_${String(moduleId).replace(/-/g, '_').toUpperCase()}_PATH`;
  return process.env[envKey] || DEFAULT_PATHS[moduleId] || `/api/v1/${moduleId}/summary`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Call one partner module through the gateway.
 * @param {string} moduleId - e.g. "library", "registrar"
 * @param {object} [opts]
 * @param {string} [opts.accessToken] - JWT to forward so the partner can identify the user
 * @returns {Promise<{ ok: boolean, online: boolean, moduleId: string, data?: any, message?: string, status?: number }>}
 */
async function getModuleSummary(moduleId, opts = {}) {
  const gateway = process.env.GATEWAY_URL;
  const path = pathFor(moduleId);

  if (!gateway) {
    return {
      ok: false,
      online: false,
      moduleId,
      message:
        'Integration is not configured. Set GATEWAY_URL to the shared API gateway base URL.',
    };
  }

  const url = `${gateway.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    Accept: 'application/json',
    'X-Source-Module': 'landing-cms',
  };
  if (opts.accessToken) {
    headers.Authorization = `Bearer ${opts.accessToken}`;
  }

  try {
    const res = await fetchWithTimeout(url, { method: 'GET', headers });

    if (!res.ok) {
      return {
        ok: false,
        online: true,
        moduleId,
        status: res.status,
        message: `${moduleId} module responded with status ${res.status}.`,
      };
    }

    const data = await res.json();
    return { ok: true, online: true, moduleId, data };
  } catch (err) {
    const offline =
      err.name === 'AbortError' ||
      err.code === 'ECONNREFUSED' ||
      err.cause?.code === 'ECONNREFUSED';
    return {
      ok: false,
      online: false,
      moduleId,
      message: offline
        ? `The ${moduleId} module is currently offline or unreachable. Please try again later.`
        : `Integration error (${moduleId}): ${err.message}`,
    };
  }
}

/** Backward-compatible helper used by /integrations/library */
async function getLibrarySummary(opts) {
  return getModuleSummary('library', opts);
}

/**
 * Fetch live summaries for many modules in parallel.
 * @param {string[]} moduleIds
 * @param {object} [opts]
 */
async function getManyModuleSummaries(moduleIds, opts = {}) {
  const results = await Promise.all(
    moduleIds.map((id) => getModuleSummary(id, opts))
  );
  const byId = {};
  for (const r of results) byId[r.moduleId] = r;
  return byId;
}

module.exports = {
  getModuleSummary,
  getLibrarySummary,
  getManyModuleSummaries,
  DEFAULT_PATHS,
};
