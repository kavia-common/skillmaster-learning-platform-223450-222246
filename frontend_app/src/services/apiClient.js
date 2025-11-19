import config from "../config/env";

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Return resolved API base URL used for requests and logs it. */
  const base =
    (config?.apiBaseUrl && String(config.apiBaseUrl)) ||
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "http://localhost:3001";
  // eslint-disable-next-line no-console
  console.debug("[apiClient] Using API_BASE:", base);
  return base.replace(/\/+$/, "");
}

/**
 * Map common fetch/preflight/CORS errors into a concise hint the UI can show.
 * @param {string} url - full request URL
 * @param {Error} err - original error
 * @returns {Error} same error with augmented message and a uiHint field
 */
function withNetworkHint(url, err) {
  const origin =
    (typeof window !== "undefined" && window.location && window.location.origin) ||
    "unknown-origin";
  const base = getApiBase();
  const isTypeErrorFetchFailed =
    err && (err.name === "TypeError" || err.message?.includes("Failed to fetch"));

  const hint =
    `Network request failed.\n` +
    `- Frontend origin: ${origin}\n` +
    `- API base: ${base}\n` +
    `- Request: ${url}\n` +
    `Quick checks:\n` +
    `1) Backend /health should return 200 (GET ${base}/health or ${base}/)\n` +
    `2) Backend /openapi.json should return 200\n` +
    `3) If CORS error: ensure backend CORSMiddleware allow_origins includes "${origin}", ` +
    `and do not use "*" if credentials=true. Set allow_credentials=True.\n` +
    `4) Verify REACT_APP_API_BASE/REACT_APP_BACKEND_URL points to the backend (port 3001)\n` +
    `5) If 404: confirm endpoint path matches backend spec`;

  if (isTypeErrorFetchFailed) {
    err.uiHint = hint;
  }
  return err;
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

// INTERNAL request with diagnostics
async function request(path, options = {}) {
  const base = getApiBase();
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
    body:
      options.body != null
        ? typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body)
        : undefined,
    signal: options.signal,
    mode: options.mode || "cors",
    cache: options.cache || "no-cache",
  };

  // eslint-disable-next-line no-console
  console.debug(`[apiClient] ${opts.method} ${url}`);
  try {
    const res = await fetch(url, opts);
    const data = await parseJsonSafe(res);
    if (!res.ok) {
      const err = new Error(
        (data && (data.message || data.error || data.detail)) ||
          `Request failed with status ${res.status}`
      );
      err.status = res.status;
      err.url = url;
      err.method = opts.method;
      throw withNetworkHint(url, err);
    }
    return { status: res.status, ok: true, data, headers: res.headers };
  } catch (e) {
    throw withNetworkHint(url, e);
  }
}

// PUBLIC_INTERFACE
export async function apiGet(path, options = {}) {
  /** Perform a GET request with diagnostics. */
  return request(path, { ...options, method: "GET" });
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, options = {}) {
  /** Perform a POST request with diagnostics. */
  return request(path, { ...options, method: "POST", body });
}

export default {
  getApiBase,
  get: apiGet,
  post: apiPost,
};
