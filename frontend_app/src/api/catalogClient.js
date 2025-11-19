import { apiGet, getApiBase } from "../services/apiClient";

/**
 * PUBLIC_INTERFACE
 * Catalog API Client for content-prefixed endpoints.
 */
const API_BASE = getApiBase();

/** Normalize list responses to an array. */
function toArrayPayload(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

// PUBLIC_INTERFACE
export async function fetchSkills({ subject_slug, level, category, limit = 12, offset = 0 } = {}) {
  // Try relational first
  try {
    const qsObj = Object.fromEntries(
      Object.entries({ subject_slug, level }).filter(([, v]) => v != null && v !== "")
    );
    const qs = new URLSearchParams(qsObj).toString();
    const res = await apiGet(`/skills${qs ? `?${qs}` : ""}`);
    const arr = toArrayPayload(res.data);
    if (arr.length) return { data: arr };
  } catch {
    // ignore and fallback
  }

  // Fallback to content
  const pageSize = Math.max(1, Number(limit) || 12);
  const page = Math.max(1, Math.floor((Number(offset) || 0) / pageSize) + 1);
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (level) params.set("difficulty", level);
  params.set("page", String(page));
  params.set("page_size", String(pageSize));
  const res2 = await apiGet(`/content/skills${params.toString() ? `?${params.toString()}` : ""}`);
  return { data: toArrayPayload(res2.data) };
}

// PUBLIC_INTERFACE
export async function fetchSubjects(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await apiGet(`/subjects${qs ? `?${qs}` : ""}`);
  return { data: toArrayPayload(res.data) };
}

// PUBLIC_INTERFACE
export async function fetchSubjectModules(subjectId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await apiGet(`/subjects/${encodeURIComponent(subjectId)}/modules${qs ? `?${qs}` : ""}`);
  return { data: toArrayPayload(res.data) };
}

// PUBLIC_INTERFACE
export async function fetchModuleLessons(moduleId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await apiGet(`/modules/${encodeURIComponent(moduleId)}/lessons${qs ? `?${qs}` : ""}`);
  const data = res.data;
  if (Array.isArray(data?.items)) return { data: data.items };
  if (Array.isArray(data?.results)) return { data: data.results };
  if (Array.isArray(data?.data)) return { data: data.data };
  if (Array.isArray(data)) return { data };
  return { data: [] };
}

// PUBLIC_INTERFACE
export async function fetchLessonDetail(lessonIdentifier, preferRelational = true) {
  if (preferRelational && /^\d+$/.test(String(lessonIdentifier))) {
    const res = await apiGet(`/lessons/${encodeURIComponent(lessonIdentifier)}?include_nested=true`);
    if (res?.ok) return res.data;
  }
  const res2 = await apiGet(`/content/lessons/${encodeURIComponent(lessonIdentifier)}`);
  return res2.data;
}

// PUBLIC_INTERFACE
export async function fetchSkillBySlug(slug) {
  // Try content first
  try {
    const res = await apiGet(`/content/skills/${encodeURIComponent(slug)}`);
    if (res?.ok) return { data: res.data };
  } catch {
    // ignore
  }

  // Fallback to relational list and match
  try {
    const res2 = await apiGet(`/skills`);
    const arr = toArrayPayload(res2.data);
    const found = arr.find((s) => (s.slug || s.name) === slug);
    if (found) return { data: found };
  } catch {
    // ignore
  }

  const err = new Error("Skill not found");
  err.status = 404;
  throw err;
}

// PUBLIC_INTERFACE
export async function fetchLessonsBySkillSlug(slug) {
  const res = await apiGet(`/content/skills/${encodeURIComponent(slug)}/lessons`);
  const arr = toArrayPayload(res.data);
  return { data: arr };
}

// PUBLIC_INTERFACE
export async function fetchLessonById(id) {
  // Prefer content lesson endpoint (supports string id/slug)
  try {
    const res = await apiGet(`/content/lessons/${encodeURIComponent(id)}`);
    if (res?.ok) return { data: res.data };
  } catch {
    // ignore
  }

  // Fallback: if numeric, try relational by id
  if (/^\d+$/.test(String(id))) {
    const res2 = await apiGet(`/lessons/${encodeURIComponent(id)}?include_nested=true`);
    if (res2?.ok) return { data: res2.data };
  }

  return { data: null };
}

export const baseUrl = API_BASE;

/** Trigger backend seeds endpoint for local/dev convenience. Returns boolean. */
// PUBLIC_INTERFACE
export async function runSeeds() {
  try {
    const res = await fetch(`${API_BASE}/__run_seeds`, {
      credentials: "include",
      headers: { Accept: "application/json" },
      mode: "cors",
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    return !!data?.ok;
  } catch {
    return false;
  }
}

export default {
  baseUrl: API_BASE,
  fetchSkills,
  fetchSubjects,
  fetchSubjectModules,
  fetchModuleLessons,
  fetchLessonDetail,
  fetchSkillBySlug,
  fetchLessonsBySkillSlug,
  fetchLessonById,
  runSeeds,
};
