import config from "../config/env";

/**
 * PUBLIC_INTERFACE
 * Catalog API Client
 *
 * Resolves endpoints across both content (/content/*) and relational APIs to maximize compatibility.
 * Includes robust normalization for {items, results, data, array} payload shapes.
 */
const API_BASE = config.apiBaseUrl;

/** Normalize list responses to an array. */
function toArrayPayload(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

// PUBLIC_INTERFACE
export async function fetchSkills({ subject_slug, level, category, limit = 12, offset = 0 } = {}) {
  /**
   * Fetch skills: prefer relational /skills, fallback to /content/skills listing.
   * Accepts filters for subject_slug/level (relational) and category/difficulty (content).
   */
  const pageSize = Math.max(1, Number(limit) || 12);
  const page = Math.max(1, Math.floor((Number(offset) || 0) / pageSize) + 1);

  // Try relational first to better support progressive skills
  try {
    const qsObj = Object.fromEntries(
      Object.entries({ subject_slug, level }).filter(([_, v]) => v != null && v !== '')
    );
    const qs = new URLSearchParams(qsObj).toString();
    const res = await fetch(`${API_BASE}/skills${qs ? `?${qs}` : ''}`, { credentials: 'include', headers: { Accept: 'application/json' }});
    if (res.ok) {
      const data = await res.json();
      return { data: Array.isArray(data) ? data : toArrayPayload(data) };
    }
  } catch (_) { /* ignore */ }

  // Fallback to content skills with pagination
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (level) params.set('difficulty', level);
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  const res2 = await fetch(`${API_BASE}/content/skills${params.toString() ? `?${params}` : ''}`, { credentials: 'include', headers: { Accept: 'application/json' }});
  if (!res2.ok) throw new Error('Failed to fetch skills from both endpoints');
  const data2 = await res2.json();
  return { data: toArrayPayload(data2) };
}

// PUBLIC_INTERFACE
export async function fetchSubjects(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/subjects${qs ? `?${qs}` : ''}`, { credentials: 'include', headers: { Accept: 'application/json' }});
  if (!res.ok) throw new Error('Failed to fetch subjects');
  const data = await res.json();
  return { data: toArrayPayload(data) };
}

// PUBLIC_INTERFACE
export async function fetchSubjectModules(subjectId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/subjects/${subjectId}/modules${qs ? `?${qs}` : ''}`, { credentials: 'include', headers: { Accept: 'application/json' }});
  if (!res.ok) throw new Error('Failed to fetch modules');
  const data = await res.json();
  return { data: toArrayPayload(data) };
}

// PUBLIC_INTERFACE
export async function fetchModuleLessons(moduleId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/modules/${moduleId}/lessons${qs ? `?${qs}` : ''}`, { credentials: 'include', headers: { Accept: 'application/json' }});
  if (!res.ok) throw new Error('Failed to fetch lessons');
  const data = await res.json();
  if (Array.isArray(data.items)) return { data: data.items };
  if (Array.isArray(data.results)) return { data: data.results };
  if (Array.isArray(data.data)) return { data: data.data };
  if (Array.isArray(data)) return { data };
  return { data: [] };
}

// PUBLIC_INTERFACE
export async function fetchLessonDetail(lessonIdentifier, preferRelational = true) {
  /**
   * Retrieve lesson detail. If preferRelational, treat identifier as numeric id.
   * Fallback to content lesson by slug.
   */
  if (preferRelational && /^\d+$/.test(String(lessonIdentifier))) {
    const res = await fetch(`${API_BASE}/lessons/${lessonIdentifier}?include_nested=true`, { credentials: 'include', headers: { Accept: 'application/json' }});
    if (res.ok) return await res.json();
  }
  const res2 = await fetch(`${API_BASE}/content/lessons/${lessonIdentifier}`, { credentials: 'include', headers: { Accept: 'application/json' }});
  if (!res2.ok) throw new Error('Failed to fetch lesson detail');
  return await res2.json();
}

/**
 * PUBLIC_INTERFACE
 * fetchSkillBySlug - Get a single catalog skill by slug via /content/skills/{slug}.
 * Falls back to /skills (relational) search if needed.
 */
export async function fetchSkillBySlug(slug) {
  // Try content first
  try {
    const res = await fetch(`${API_BASE}/content/skills/${encodeURIComponent(slug)}`, { credentials: 'include', headers: { Accept: 'application/json' }});
    if (res.ok) {
      const data = await res.json();
      return { data };
    }
  } catch (_) { /* ignore */ }

  // Fallback: fetch all relational skills and match by slug if available
  try {
    const res2 = await fetch(`${API_BASE}/skills`, { credentials: 'include', headers: { Accept: 'application/json' }});
    if (res2.ok) {
      const list = await res2.json();
      const arr = Array.isArray(list) ? list : toArrayPayload(list);
      const found = arr.find(s => (s.slug || s.name) === slug);
      if (found) return { data: found };
    }
  } catch (_) { /* ignore */ }

  // Ultimately return a 404-like structure for graceful handling
  const err = new Error('Skill not found');
  err.status = 404;
  throw err;
}

/**
 * PUBLIC_INTERFACE
 * fetchLessonsBySkillSlug - List lessons for a catalog skill by slug via /content/skills/{slug}/lessons.
 * Returns array payload.
 */
export async function fetchLessonsBySkillSlug(slug) {
  const res = await fetch(`${API_BASE}/content/skills/${encodeURIComponent(slug)}/lessons`, { credentials: 'include', headers: { Accept: 'application/json' }});
  if (!res.ok) {
    // On 404 or empty, return empty list gracefully
    if (res.status === 404) return { data: [] };
    throw new Error(`Failed to fetch lessons for skill: ${slug}`);
  }
  const data = await res.json();
  return { data: toArrayPayload(data) };
}

/**
 * PUBLIC_INTERFACE
 * fetchLessonById - Retrieve a catalog lesson by id/slug via /content/lessons/{id}.
 * Accepts an optional { skillSlug } hint for future use.
 */
export async function fetchLessonById(id, { skillSlug } = {}) {
  // Prefer content lesson endpoint (supports string id/slug)
  const res = await fetch(`${API_BASE}/content/lessons/${encodeURIComponent(id)}`, { credentials: 'include', headers: { Accept: 'application/json' }});
  if (res.ok) {
    const data = await res.json();
    return { data };
  }

  // Fallback: if numeric, try relational by id
  if (/^\d+$/.test(String(id))) {
    const res2 = await fetch(`${API_BASE}/lessons/${encodeURIComponent(id)}?include_nested=true`, { credentials: 'include', headers: { Accept: 'application/json' }});
    if (res2.ok) {
      const data2 = await res2.json();
      return { data: data2 };
    }
  }

  if (res.status === 404) {
    // Gracefully return empty for 404
    return { data: null };
  }

  throw new Error(`Failed to fetch lesson by id: ${id}`);
}

/** Trigger backend seeds endpoint for local/dev convenience. Returns boolean. */
export async function runSeeds() {
  try {
    const res = await fetch(`${API_BASE}/__run_seeds`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    return !!data?.ok;
  } catch {
    return false;
  }
}

export const baseUrl = API_BASE;

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
