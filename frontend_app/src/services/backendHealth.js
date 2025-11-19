//
// PUBLIC_INTERFACE
// backendHealth.js - Utilities to quickly verify backend connectivity, CORS, and seed availability from the running frontend.
//
// Note: This is a non-UI helper used in pages for quick diagnostics and can be extended.
// It does not automatically run to avoid noisy console logs in production.

import config from "../config/env";

/**
 * PUBLIC_INTERFACE
 * probeBackend - Perform lightweight GETs to validate backend availability and CORS.
 *
 * It attempts:
 * - GET /openapi.json
 * - GET /skills
 * - GET /content/skills
 * - GET /subjects
 *
 * Returns a summary object with status booleans and raw status codes.
 */
export async function probeBackend() {
  const base = (config.apiBaseUrl || "").replace(/\/+$/, "");
  const headers = { Accept: "application/json" };
  const creds = "include";

  async function tryGet(path) {
    try {
      const res = await fetch(`${base}${path}`, { method: "GET", headers, credentials: creds, mode: "cors" });
      return { ok: res.ok, status: res.status };
    } catch (e) {
      return { ok: false, status: 0, error: e?.message || String(e) };
    }
  }

  const checks = await Promise.all([
    tryGet("/openapi.json"),
    tryGet("/skills"),
    tryGet("/content/skills"),
    tryGet("/subjects"),
  ]);

  return {
    base,
    openapi: checks[0],
    skills: checks[1],
    contentSkills: checks[2],
    subjects: checks[3],
  };
}

/**
 * PUBLIC_INTERFACE
 * expectedCorsNote - Returns the expected CORS configuration so UI can show a helpful note.
 */
export function expectedCorsNote() {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  return {
    allowOrigin: origin,
    allowCredentials: true,
    note:
      "Backend CORS should include Access-Control-Allow-Origin: " +
      origin +
      " and Access-Control-Allow-Credentials: true",
  };
}

export default {
  probeBackend,
  expectedCorsNote,
};
