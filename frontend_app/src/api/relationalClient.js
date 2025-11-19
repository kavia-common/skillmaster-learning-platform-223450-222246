import { apiGet, apiPost, getApiBase } from "../services/apiClient";

/**
 * Relational API client aligned with backend OpenAPI.
 * PUBLIC_INTERFACE
 */
export const baseUrl = getApiBase();

/** Normalize various list shapes into { items, total } */
function normalizeList(data) {
  if (Array.isArray(data)) return { items: data, total: data.length };
  if (data && typeof data === "object") {
    if (Array.isArray(data.items)) return { items: data.items, total: data.total ?? data.items.length };
    if (Array.isArray(data.results)) return { items: data.results, total: data.total ?? data.results.length };
  }
  return { items: [], total: 0 };
}

// Subjects

// PUBLIC_INTERFACE
export async function listSubjects(params = {}) {
  /** List subjects with pagination and optional search. */
  const qs = new URLSearchParams(params).toString();
  const path = `/subjects${qs ? `?${qs}` : ""}`;
  const res = await apiGet(path);
  return { ...res, data: normalizeList(res.data) };
}

// PUBLIC_INTERFACE
export async function getSubject(subjectId, { include_nested = false } = {}) {
  /** Get a subject by id; include_nested=true to include modules tree. */
  const qs = new URLSearchParams();
  if (include_nested) qs.set("include_nested", "true");
  const path = `/subjects/${encodeURIComponent(subjectId)}${qs.toString() ? `?${qs.toString()}` : ""}`;
  return apiGet(path);
}

// Modules

// PUBLIC_INTERFACE
export async function listModules(params = {}) {
  /** List modules with optional subject_id filter and search. */
  const qs = new URLSearchParams(params).toString();
  const path = `/modules${qs ? `?${qs}` : ""}`;
  const res = await apiGet(path);
  return { ...res, data: normalizeList(res.data) };
}

// PUBLIC_INTERFACE
export async function listModulesBySubject(subjectId, params = {}) {
  /** List modules for a subject with pagination/search. */
  const qs = new URLSearchParams(params).toString();
  const path = `/subjects/${encodeURIComponent(subjectId)}/modules${qs ? `?${qs}` : ""}`;
  const res = await apiGet(path);
  return { ...res, data: normalizeList(res.data) };
}

// PUBLIC_INTERFACE
export async function getModule(moduleId, { include_nested = false } = {}) {
  /** Get a module by id; include_nested=true to include lessons. */
  const qs = new URLSearchParams();
  if (include_nested) qs.set("include_nested", "true");
  const path = `/modules/${encodeURIComponent(moduleId)}${qs.toString() ? `?${qs.toString()}` : ""}`;
  return apiGet(path);
}

// Lessons

// PUBLIC_INTERFACE
export async function listLessonsByModule(moduleId, params = {}) {
  /** List lessons for a module with pagination/search. */
  const qs = new URLSearchParams(params).toString();
  const path = `/modules/${encodeURIComponent(moduleId)}/lessons${qs ? `?${qs}` : ""}`;
  const res = await apiGet(path);
  return { ...res, data: normalizeList(res.data) };
}

// PUBLIC_INTERFACE
export async function getLesson(lessonId, { include_nested = false } = {}) {
  /** Get lesson by id; include_nested=true to include activities. */
  const qs = new URLSearchParams();
  if (include_nested) qs.set("include_nested", "true");
  const path = `/lessons/${encodeURIComponent(lessonId)}${qs.toString() ? `?${qs.toString()}` : ""}`;
  return apiGet(path);
}

// Activities

// PUBLIC_INTERFACE
export async function listActivitiesByLesson(lessonId, params = {}) {
  /** List activities for a lesson with pagination. */
  const qs = new URLSearchParams(params).toString();
  const path = `/lessons/${encodeURIComponent(lessonId)}/activities${qs ? `?${qs}` : ""}`;
  return apiGet(path);
}

// Skills (progression)

// PUBLIC_INTERFACE
export async function listSkills(params = {}) {
  /** List progression skills with optional subject_slug and level filters. */
  const qs = new URLSearchParams(params).toString();
  const path = `/skills${qs ? `?${qs}` : ""}`;
  const res = await apiGet(path);
  return { ...res, data: normalizeList(res.data) };
}

// Progress

// PUBLIC_INTERFACE
export async function getUserProgress(userId) {
  /** Get aggregated progress for a user. */
  const path = `/progress/${encodeURIComponent(userId)}`;
  return apiGet(path);
}

// PUBLIC_INTERFACE
export async function getLessonProgressForUser(userId, lessonId) {
  /** Get all progress entries for a user and lesson. */
  const path = `/progress/${encodeURIComponent(userId)}/lesson/${encodeURIComponent(lessonId)}`;
  return apiGet(path);
}

// PUBLIC_INTERFACE
export async function markLessonComplete(body) {
  /** Mark a lesson as completed for a user with an optional score. */
  const path = `/progress/complete`;
  return apiPost(path, body);
}

/** Trigger backend seeds endpoint for local/dev convenience. Returns boolean. */
// PUBLIC_INTERFACE
export async function runSeeds() {
  try {
    const base = baseUrl || getApiBase();
    const res = await fetch(`${base}/__run_seeds`, {
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

const relationalApi = {
  baseUrl,
  listSubjects,
  getSubject,
  listModules,
  listModulesBySubject,
  getModule,
  listLessonsByModule,
  getLesson,
  listActivitiesByLesson,
  listSkills,
  getUserProgress,
  getLessonProgressForUser,
  markLessonComplete,
  runSeeds,
};

export default relationalApi;
