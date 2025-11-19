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
      return Array.isArray(data) ? data : toArrayPayload(data);
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
  return toArrayPayload(data2);
}

// PUBLIC_INTERFACE
export async function fetchSubjects(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/subjects${qs ? `?${qs}` : ''}`, { credentials: 'include', headers: { Accept: 'application/json' }});
  if (!res.ok) throw new Error('Failed to fetch subjects');
  const data = await res.json();
  return toArrayPayload(data);
}

// PUBLIC_INTERFACE
export async function fetchSubjectModules(subjectId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/subjects/${subjectId}/modules${qs ? `?${qs}` : ''}`, { credentials: 'include', headers: { Accept: 'application/json' }});
  if (!res.ok) throw new Error('Failed to fetch modules');
  const data = await res.json();
  return toArrayPayload(data);
}

// PUBLIC_INTERFACE
export async function fetchModuleLessons(moduleId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/modules/${moduleId}/lessons${qs ? `?${qs}` : ''}`, { credentials: 'include', headers: { Accept: 'application/json' }});
  if (!res.ok) throw new Error('Failed to fetch lessons');
  const data = await res.json();
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
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

export const baseUrl = API_BASE;

export default {
  baseUrl: API_BASE,
  fetchSkills,
  fetchSubjects,
  fetchSubjectModules,
  fetchModuleLessons,
  fetchLessonDetail,
};
