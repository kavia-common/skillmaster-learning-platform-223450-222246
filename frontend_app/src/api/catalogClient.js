import config from "../config/env";

//
// PUBLIC_INTERFACE
// catalogClient.js - Thin API layer for catalog endpoints (skills, lessons)
// Aligned with FastAPI routes: /content/skills, /content/skills/{slug}, /content/skills/{slug}/lessons,
// with graceful fallbacks to /skills and related endpoints.
//
const BASE_URL = config.apiBaseUrl;

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

function toPageParams(limit = 12, offset = 0) {
  const pageSize = Math.max(1, Number(limit) || 12);
  const page = Math.max(1, Math.floor((Number(offset) || 0) / pageSize) + 1);
  return { page, page_size: pageSize };
}

// PUBLIC_INTERFACE
export async function fetchSkills({ category, limit = 12, offset = 0 } = {}) {
  /**
   * Retrieve paginated skills, optionally filtered by category.
   * Maps to GET /content/skills with page/page_size, falling back to /skills (array) if needed.
   */
  const { page, page_size } = toPageParams(limit, offset);
  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  qs.set("page", String(page));
  qs.set("page_size", String(page_size));

  // Prefer content library (supports pagination and filters)
  const url = `${BASE_URL}/content/skills${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (res.ok) return handleResponse(res);

  // Fallback: legacy /skills (returns array)
  const fallback = await fetch(`${BASE_URL}/skills`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  return handleResponse(fallback);
}

// PUBLIC_INTERFACE
export async function fetchSkillBySlug(slug) {
  /**
   * Retrieve a single skill by slug, preferring /content/skills/{slug}.
   * Fallbacks: /skills/{id} or searching /skills array by slug/name.
   */
  const primary = `${BASE_URL}/content/skills/${encodeURIComponent(slug)}`;
  const res = await fetch(primary, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (res.ok) return handleResponse(res);

  // Fallback by ID path (numeric/integer ids likely for relational /skills/{skill_id})
  const byId = await fetch(`${BASE_URL}/skills/${encodeURIComponent(slug)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (byId.ok) return handleResponse(byId);

  // Fallback: search in /skills list
  const list = await fetch(`${BASE_URL}/skills`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  }).then(handleResponse);

  const found =
    Array.isArray(list.data) &&
    list.data.find((s) => s.slug === slug || String(s.id) === String(slug) || s.name === slug);
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
   * Retrieve lessons for a given skill slug via /content/skills/{slug}/lessons.
   */
  const url = `${BASE_URL}/content/skills/${encodeURIComponent(slug)}/lessons`;
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
   * Retrieve a single lesson by id or slug.
   * Tries /content/lessons/{id}, fallback to searching lessons under provided skillSlug.
   */
  const direct = await fetch(`${BASE_URL}/content/lessons/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (direct.ok) return handleResponse(direct);

  if (!skillSlug) {
    const e = new Error("Lesson not found (provide skillSlug for fallback search)");
    e.status = direct.status || 404;
    throw e;
  }

  const lessons = await fetchLessonsBySkillSlug(skillSlug);
  const lesson =
    Array.isArray(lessons.data) &&
    lessons.data.find((l) => String(l.id) === String(id) || String(l.slug) === String(id));
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
