
const DEFAULT_TIMEOUT_MS = 30000;

const DEFAULT_PATHS = {
  library: '/books',
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
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function offlineResult(moduleId, message) {
  return {
    ok: false,
    online: false,
    moduleId,
    message,
  };
}

async function getLibrarySummary() {
  const baseUrl = process.env.LIBRARY_API_BASE_URL;

  if (!baseUrl) {
    return offlineResult(
      'library',
      'Library API is not configured. Set LIBRARY_API_BASE_URL.'
    );
  }

  const url = `${baseUrl.replace(/\/+$/, '')}/books`;

  try {
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Source-Module': 'landing-cms',
      },
    });

    if (!res.ok) {
      return {
        ok: false,
        online: true,
        moduleId: 'library',
        status: res.status,
        message: `Library API responded with status ${res.status}.`,
      };
    }

    const books = await res.json();

    if (!Array.isArray(books)) {
      return {
        ok: true,
        online: true,
        moduleId: 'library',
        data: {
          summary: 'Library API connected, but the books response has an unexpected format.',
          books,
        },
      };
    }

    const availableCopies = books.reduce(
      (total, book) => total + (Number(book.availableQuantity) || 0),
      0
    );

    return {
      ok: true,
      online: true,
      moduleId: 'library',
      data: {
        summary: `${books.length} book records retrieved from the Library API. ${availableCopies} available copies.`,
        totalBooks: books.length,
        availableCopies,
        books,
      },
    };
  } catch (err) {
    return offlineResult(
      'library',
      err.name === 'AbortError'
        ? 'Library API request timed out.'
        : `Library integration error: ${err.message}`
    );
  }
}

async function getModuleSummary(moduleId, opts = {}) {
  if (moduleId === 'library') {
    return getLibrarySummary();
  }

  const gateway = process.env.GATEWAY_URL;
  const path = pathFor(moduleId);

  if (!gateway) {
    return offlineResult(
      moduleId,
      'Integration is not configured. Set GATEWAY_URL to the shared API gateway base URL.'
    );
  }

  const url = `${gateway.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = {
    Accept: 'application/json',
    'X-Source-Module': 'landing-cms',
  };

  if (opts.accessToken) {
    headers.Authorization = `Bearer ${opts.accessToken}`;
  }

  try {
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers,
    });

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

    return {
      ok: true,
      online: true,
      moduleId,
      data,
    };
  } catch (err) {
    return offlineResult(
      moduleId,
      err.name === 'AbortError'
        ? `${moduleId} module request timed out.`
        : `Integration error (${moduleId}): ${err.message}`
    );
  }
}

async function getManyModuleSummaries(moduleIds, opts = {}) {
  const results = await Promise.all(
    moduleIds.map((id) => getModuleSummary(id, opts))
  );

  const byId = {};

  for (const result of results) {
    byId[result.moduleId] = result;
  }

  return byId;
}

module.exports = {
  getModuleSummary,
  getLibrarySummary,
  getManyModuleSummaries,
  DEFAULT_PATHS,
};
