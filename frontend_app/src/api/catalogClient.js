//
// PUBLIC_INTERFACE
// catalogClient.js - Thin API layer for catalog endpoints (skills, lessons)
// Reads base URL from REACT_APP_BACKEND_URL (or REACT_APP_API_BASE), with a preview-friendly fallback.
//
const pickBaseUrl = () => {
  const envBase =
    (process.env.REACT_APP_API_BASE && process.env.REACT_APP_API_BASE.trim()) ||
    (process.env.REACT_APP_BACKEND_URL && process.env.REACT_APP_BACKEND_URL.trim());

  if (envBase) return envBase.replace(/\/+$/, "");

  // Fallback: try to replace common local dev port 3000 -> 3001
  try {
    const origin = window.location.origin;
    if (origin.includes(":3000")) return origin.replace(":3000", ":3001");
    return origin;
  } catch {
    return "http://localhost:3001";
  }
};

const BASE_URL = pickBaseUrl();

async function handleResponse(res) {
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const message =
      (data && (data.message || data.error || data.detail)) ||
      `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return { status: res.status, ok: true, data, headers: res.headers };
}

// PUBLIC_INTERFACE
export async function fetchSkills({ category, limit = 12, offset = 0 } = {}) {
  /**
   * Retrieve paginated skills, optionally filtered by category.
   * @param {object} params
   * @param {string} [params.category]
   * @param {number} [params.limit=12]
   * @param {number} [params.offset=0]
   * @returns {Promise<{status:number, ok:boolean, data:any[]}>}
   */
  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  if (limit != null) qs.set("limit", String(limit));
  if (offset != null) qs.set("offset", String(offset));
  const url = `${BASE_URL}/api/catalog/skills${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function fetchSkillBySlug(slug) {
  /**
   * Retrieve a single skill by slug (if backend supports), otherwise fall back to list + find.
   * @param {string} slug
   */
  const primary = `${BASE_URL}/api/catalog/skills/${encodeURIComponent(slug)}`;
  const res = await fetch(primary, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (res.ok) return handleResponse(res);

  // Fallback: best-effort fetch from list and find by id/slug
  const list = await fetch(`${BASE_URL}/api/catalog/skills`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  }).then(handleResponse);

  const found =
    Array.isArray(list.data) &&
    list.data.find((s) => s.slug === slug || s.id === slug || s.name === slug);
  if (!found) {
    const e = new Error("Skill not found");
    e.status = 404;
    throw e;
  }
  return { status: 200, ok: true, data: found };
}

// PUBLIC_INTERFACE
export async function fetchLessonsBySkillSlug(slug) {
  /**
   * Retrieve lessons for a given skill slug.
   * @param {string} slug
   */
  const url = `${BASE_URL}/api/catalog/lessons?skill_slug=${encodeURIComponent(slug)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function fetchLessonById(id, { skillSlug } = {}) {
  /**
   * Retrieve a single lesson by id. If no direct endpoint exists, fetch lessons for skill and find.
   * @param {string} id
   * @param {{skillSlug?: string}} options
   */
  // Try a hypothetical endpoint first
  const direct = await fetch(`${BASE_URL}/api/catalog/lessons/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (direct.ok) return handleResponse(direct);

  // Fallback: need skillSlug to search within lessons
  if (!skillSlug) {
    // Last resort: pull many skills and try to locate; not ideal but keeps demo functional
    const all = await fetch(`${BASE_URL}/api/catalog/skills`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    }).then(handleResponse);

    for (const s of all.data || []) {
      const lessonsRes = await fetch(
        `${BASE_URL}/api/catalog/lessons?skill_slug=${encodeURIComponent(s.slug || s.id)}`,
        { method: "GET", headers: { Accept: "application/json" }, credentials: "include" }
      ).then(handleResponse);
      const found = Array.isArray(lessonsRes.data)
        ? lessonsRes.data.find((l) => l.id === id)
        : null;
      if (found) return { status: 200, ok: true, data: found };
    }
    const e = new Error("Lesson not found");
    e.status = 404;
    throw e;
  }

  const lessons = await fetchLessonsBySkillSlug(skillSlug);
  const lesson =
    Array.isArray(lessons.data) && lessons.data.find((l) => String(l.id) === String(id));
  if (!lesson) {
    const e = new Error("Lesson not found");
    e.status = 404;
    throw e;
  }
  return { status: 200, ok: true, data: lesson };
}

export const baseUrl = BASE_URL;

export default {
  baseUrl: BASE_URL,
  fetchSkills,
  fetchSkillBySlug,
  fetchLessonsBySkillSlug,
  fetchLessonById,
};
