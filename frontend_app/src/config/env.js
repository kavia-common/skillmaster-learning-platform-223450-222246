//
// PUBLIC_INTERFACE
// env.js - Centralized environment/config loader for the frontend.
//
// This module reads environment variables exposed to the React app and provides
// sane defaults for local development. It also parses feature flags and exposes
// a normalized config object for consumers.
//
// Notes:
// - CRA exposes variables prefixed with REACT_APP_.
// - No secrets should be placed here; this only reads public env vars.
//
const parseJsonSafe = (value, fallback) => {
  if (value == null || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const parseFeatureFlags = (raw) => {
  // Accept JSON ("{\"newUI\":true}") or comma-separated ("flagA,flagB:1")
  if (!raw) return {};
  const asJson = parseJsonSafe(raw, null);
  if (asJson && typeof asJson === "object") {
    return asJson;
  }
  // Fallback: parse comma-separated key[=:]value?, true if no value
  const flags = {};
  raw.split(",").map((s) => s.trim()).filter(Boolean).forEach((pair) => {
    const [k, v] = pair.split(/[:=]/).map((x) => (x || "").trim());
    if (!k) return;
    if (v === undefined || v === "") {
      flags[k] = true;
    } else if (["true", "1", "on", "yes"].includes(v.toLowerCase())) {
      flags[k] = true;
    } else if (["false", "0", "off", "no"].includes(v.toLowerCase())) {
      flags[k] = false;
    } else {
      flags[k] = v;
    }
  });
  return flags;
};

/**
 * Determine base API URL with sane defaults.
 * - Default to http://localhost:3001 for local development as required.
 * - If running behind a proxy/alternate host, REACT_APP_API_BASE or REACT_APP_BACKEND_URL can override.
 */
const DEFAULT_API_BASE = "http://localhost:3001";
// Prefer REACT_APP_API_BASE, then REACT_APP_BACKEND_URL, then default
const API_BASE =
  process.env.REACT_APP_API_BASE?.trim() ||
  process.env.REACT_APP_BACKEND_URL?.trim() ||
  DEFAULT_API_BASE;

// Normalize log level
const LOG_LEVEL = (process.env.REACT_APP_LOG_LEVEL || "warn").toLowerCase();

// Feature flags
const FEATURE_FLAGS = parseFeatureFlags(process.env.REACT_APP_FEATURE_FLAGS);

// Additional optional envs
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
const WS_URL = process.env.REACT_APP_WS_URL || "";
const NODE_ENV = process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development";
const HEALTHCHECK_PATH = process.env.REACT_APP_HEALTHCHECK_PATH || "/healthz";

export const config = {
  apiBaseUrl: API_BASE.replace(/\/+$/, ""),
  frontendUrl: FRONTEND_URL.replace(/\/+$/, ""),
  wsUrl: WS_URL,
  nodeEnv: NODE_ENV,
  logLevel: LOG_LEVEL,
  featureFlags: FEATURE_FLAGS,
  healthcheckPath: HEALTHCHECK_PATH,
};

// PUBLIC_INTERFACE
export function isFeatureEnabled(flagName, defaultValue = false) {
  /**
   * Check if a feature flag is enabled.
   *
   * @param {string} flagName - Feature flag key to look up.
   * @param {boolean} [defaultValue=false] - Default if flag not present.
   * @returns {boolean} true if enabled, otherwise false.
   */
  if (Object.prototype.hasOwnProperty.call(config.featureFlags, flagName)) {
    const v = config.featureFlags[flagName];
    return !!v;
  }
  return !!defaultValue;
}

// PUBLIC_INTERFACE
export function getConfig() {
  /**
   * Retrieve the immutable configuration object for the app.
   *
   * @returns {Readonly<object>} The configuration.
   */
  return Object.freeze({ ...config });
}

export default config;
