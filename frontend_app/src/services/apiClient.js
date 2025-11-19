import config from "../config/env";

// Lightweight logger honoring LOG_LEVEL
const LEVELS = ["error", "warn", "info", "debug"];
const currentLevelIdx = LEVELS.indexOf(config.logLevel ?? "warn");

// Avoid logging sensitive data; only method, url, status, and duration.
function log(level, ...args) {
  const idx = LEVELS.indexOf(level);
  if (idx <= currentLevelIdx && idx !== -1) {
    // eslint-disable-next-line no-console
    console[level](...args);
  }
}

function normalizeError(err, meta = {}) {
  const base = {
    name: err?.name || "ApiError",
    message: err?.message || "Unknown error",
    status: err?.status || 0,
    code: err?.code || "UNKNOWN",
    details: err?.details || undefined,
    ...meta,
  };
  const e = new Error(base.message);
  Object.assign(e, base);
  return e;
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // fallback to raw text
  }
}

/**
 * Internal request function using fetch.
 * Note: credentials are sent as "include" by default for all requests.
 * Ensure FastAPI CORS is configured to allow origin http://localhost:3000 and allow_credentials=True.
 */
async function request(path, options = {}) {
  const startedAt = performance.now();
  const base = (config.apiBaseUrl || "").replace(/\/+$/, "");
  const tail = String(path || "");
  const url = `${base}${tail.startsWith("/") ? "" : "/"}${tail}`;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const opts = {
    method: options.method || "GET",
    headers,
    credentials: options.credentials || "include",
    body: options.body ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body)) : undefined,
    signal: options.signal,
    mode: options.mode || "cors",
    cache: options.cache || "no-cache",
  };

  try {
    log("debug", "[api] →", opts.method, url);
    const res = await fetch(url, opts);
    const duration = Math.round(performance.now() - startedAt);

    const data = await parseJsonSafe(res);
    if (!res.ok) {
      const apiErr = normalizeError(
        new Error((data && (data.message || data.error || data.detail)) || `Request failed with status ${res.status}`),
        {
          status: res.status,
          code: (data && (data.code || data.error?.code)) || "HTTP_ERROR",
          url,
          method: opts.method,
        }
      );
      log("warn", "[api] ←", res.status, opts.method, url, `${duration}ms`);
      throw apiErr;
    }

    log("info", "[api] ←", res.status, opts.method, url, `${duration}ms`);
    return {
      status: res.status,
      ok: true,
      data,
      headers: res.headers,
    };
  } catch (err) {
    // Network or parsing error
    const e = normalizeError(err, { url, method: (options.method || "GET") });
    log("error", "[api] ✖", e.status || 0, e.method, e.url, e.message);
    throw e;
  }
}

// PUBLIC_INTERFACE
export function apiGet(path, options = {}) {
  /**
   * Perform a GET request to the backend API.
   *
   * @param {string} path - Relative API path (e.g., "/skills")
   * @param {object} [options] - Additional fetch options (e.g., headers)
   * @returns {Promise<{status:number,ok:boolean,data:any,headers:Headers}>}
   */
  return request(path, { ...options, method: "GET" });
}

// PUBLIC_INTERFACE
export function apiPost(path, body, options = {}) {
  /**
   * Perform a POST request to the backend API.
   *
   * @param {string} path - Relative API path.
   * @param {any} body - JSON-serializable body.
   * @param {object} [options] - Additional fetch options.
   * @returns {Promise<{status:number,ok:boolean,data:any,headers:Headers}>}
   */
  return request(path, { ...options, method: "POST", body });
}

// PUBLIC_INTERFACE
export function createApiClient(customBaseUrl) {
  /**
   * Create a scoped API client with a custom base URL.
   *
   * @param {string} customBaseUrl - Base URL to use for this client.
   * @returns {{ get: Function, post: Function }}
   */
  const baseUrl = (customBaseUrl || config.apiBaseUrl || "").replace(/\/*$/, "");

  const scopedRequest = async (path, options = {}) => {
    const startedAt = performance.now();
    const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const opts = {
      method: options.method || "GET",
      headers,
      credentials: options.credentials || "include",
      body: options.body ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body)) : undefined,
      signal: options.signal,
      mode: options.mode || "cors",
      cache: options.cache || "no-cache",
    };

    try {
      log("debug", "[api:scoped] →", opts.method, url);
      const res = await fetch(url, opts);
      const duration = Math.round(performance.now() - startedAt);
      const data = await parseJsonSafe(res);

      if (!res.ok) {
        const apiErr = normalizeError(
          new Error((data && (data.message || data.error || data.detail)) || `Request failed with status ${res.status}`),
          {
            status: res.status,
            code: (data && (data.code || data.error?.code)) || "HTTP_ERROR",
            url,
            method: opts.method,
          }
        );
        log("warn", "[api:scoped] ←", res.status, opts.method, url, `${duration}ms`);
        throw apiErr;
      }

      log("info", "[api:scoped] ←", res.status, opts.method, url, `${duration}ms`);
      return { status: res.status, ok: true, data, headers: res.headers };
    } catch (err) {
      const e = normalizeError(err, { url, method: (options.method || "GET") });
      log("error", "[api:scoped] ✖", e.status || 0, e.method, e.url, e.message);
      throw e;
    }
  };

  return {
    get: (path, options) => scopedRequest(path, { ...options, method: "GET" }),
    post: (path, body, options) => scopedRequest(path, { ...options, method: "POST", body }),
  };
}

// PUBLIC_INTERFACE
export function useApi() {
  /**
   * React hook returning API helpers.
   *
   * @returns {{ get: typeof apiGet, post: typeof apiPost }}
   */
  return { get: apiGet, post: apiPost };
}

export default {
  get: apiGet,
  post: apiPost,
};
