import config from "../config/env";

//
// PUBLIC_INTERFACE
// relationalClient.js - API helpers for Subjects → Modules → Lessons → Activities/Quizzes
// Uses env-based base URL from centralized config (REACT_APP_API_BASE or REACT_APP_BACKEND_URL).
//
const BASE_URL = config.apiBaseUrl; // Expect backend CORS to allow http://localhost:3000 with credentials

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
      (data && (data.message || data.error || data.detail)) || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return { status: res.status, ok: true, data, headers: res.headers };
}

// PUBLIC_INTERFACE
export async function listSubjects({ search, page = 1, page_size = 20 } = {}) {
  /**
   * List subjects with pagination and optional search.
   * @param {{search?:string,page?:number,page_size?:number}} params
   */
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (page) qs.set("page", String(page));
  if (page_size) qs.set("page_size", String(page_size));
  const url = `${BASE_URL}/subjects${qs.toString() ? `?${qs.toString()}` : ""}`;
  return handleResponse(
    await fetch(url, { method: "GET", headers: { Accept: "application/json" }, credentials: "include" })
  );
}

// PUBLIC_INTERFACE
export async function getSubject(subjectId, { include_nested = false } = {}) {
  /**
   * Get a subject by id. include_nested to retrieve modules tree.
   * @param {number|string} subjectId
   * @param {{include_nested?:boolean}} options
   */
  const qs = new URLSearchParams();
  if (include_nested) qs.set("include_nested", "true");
  const url = `${BASE_URL}/subjects/${encodeURIComponent(subjectId)}${qs.toString() ? `?${qs.toString()}` : ""}`;
  return handleResponse(
    await fetch(url, { method: "GET", headers: { Accept: "application/json" }, credentials: "include" })
  );
}

// PUBLIC_INTERFACE
export async function listModulesBySubject(subjectId, { search, page = 1, page_size = 20 } = {}) {
  /**
   * List modules for a subject with pagination/search.
   */
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (page) qs.set("page", String(page));
  if (page_size) qs.set("page_size", String(page_size));
  const url = `${BASE_URL}/subjects/${encodeURIComponent(subjectId)}/modules${qs.toString() ? `?${qs.toString()}` : ""}`;
  return handleResponse(
    await fetch(url, { method: "GET", headers: { Accept: "application/json" }, credentials: "include" })
  );
}

// PUBLIC_INTERFACE
export async function listModules({ subject_id, search, page = 1, page_size = 20 } = {}) {
  /**
   * List modules with optional subject_id filter.
   */
  const qs = new URLSearchParams();
  if (subject_id != null && subject_id !== "") qs.set("subject_id", String(subject_id));
  if (search) qs.set("search", search);
  if (page) qs.set("page", String(page));
  if (page_size) qs.set("page_size", String(page_size));
  const url = `${BASE_URL}/modules${qs.toString() ? `?${qs.toString()}` : ""}`;
  return handleResponse(
    await fetch(url, { method: "GET", headers: { Accept: "application/json" }, credentials: "include" })
  );
}

// PUBLIC_INTERFACE
export async function getModule(moduleId, { include_nested = false } = {}) {
  /**
   * Get a module by id. include_nested=true to include lessons.
   */
  const qs = new URLSearchParams();
  if (include_nested) qs.set("include_nested", "true");
  const url = `${BASE_URL}/modules/${encodeURIComponent(moduleId)}${qs.toString() ? `?${qs.toString()}` : ""}`;
  return handleResponse(
    await fetch(url, { method: "GET", headers: { Accept: "application/json" }, credentials: "include" })
  );
}

// PUBLIC_INTERFACE
export async function listLessonsByModule(moduleId, { search, page = 1, page_size = 20 } = {}) {
  /**
   * List lessons for a module with pagination/search.
   */
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (page) qs.set("page", String(page));
  if (page_size) qs.set("page_size", String(page_size));
  const url = `${BASE_URL}/modules/${encodeURIComponent(moduleId)}/lessons${qs.toString() ? `?${qs.toString()}` : ""}`;
  return handleResponse(
    await fetch(url, { method: "GET", headers: { Accept: "application/json" }, credentials: "include" })
  );
}

 // PUBLIC_INTERFACE
export async function getLesson(lessonId, { include_nested = false } = {}) {
  /**
   * Get lesson by id; include_nested=true to include activities.
   */
  const qs = new URLSearchParams();
  if (include_nested) qs.set("include_nested", "true");
  const url = `${BASE_URL}/lessons/${encodeURIComponent(lessonId)}${qs.toString() ? `?${qs.toString()}` : ""}`;
  return handleResponse(
    await fetch(url, { method: "GET", headers: { Accept: "application/json" }, credentials: "include" })
  );
}

/**
 * PUBLIC_INTERFACE
 * listActivitiesByLesson - List activities for a lesson with pagination.
 * @param {string|number} lessonId
 * @param {{page?:number,page_size?:number}} [options]
 */
export async function listActivitiesByLesson(lessonId, { page = 1, page_size = 20 } = {}) {
  const qs = new URLSearchParams();
  if (page) qs.set("page", String(page));
  if (page_size) qs.set("page_size", String(page_size));
  const url = `${BASE_URL}/lessons/${encodeURIComponent(LessonIdToNumber(lessonId))}/activities${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;
  return handleResponse(
    await fetch(url, { method: "GET", headers: { Accept: "application/json" }, credentials: "include" })
  );
}

/**
 * PUBLIC_INTERFACE
 * getUserProgress - Get aggregated progress for a user.
 * @param {string} userId
 */
export async function getUserProgress(userId) {
  const url = `${BASE_URL}/progress/${encodeURIComponent(userId)}`;
  return handleResponse(
    await fetch(url, { method: "GET", headers: { Accept: "application/json" }, credentials: "include" })
  );
}

/**
 * PUBLIC_INTERFACE
 * getLessonProgressForUser - Get all progress entries for a user and lesson.
 * @param {string} userId
 * @param {string|number} lessonId
 */
export async function getLessonProgressForUser(userId, lessonId) {
  const url = `${BASE_URL}/progress/${encodeURIComponent(userId)}/lesson/${encodeURIComponent(lessonId)}`;
  return handleResponse(
    await fetch(url, { method: "GET", headers: { Accept: "application/json" }, credentials: "include" })
  );
}

/**
 * PUBLIC_INTERFACE
 * markLessonComplete - Mark a lesson as completed for a user.
 * @param {{user_id:string, skill_id:string, module_id:string, lesson_id:string|number, score?:number|null}} body
 */
export async function markLessonComplete(body) {
  const url = `${BASE_URL}/progress/complete`;
  return handleResponse(
    await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
  );
}

function LessonIdToNumber(id) {
  // helper: many relational endpoints expect integer IDs
  const n = Number(id);
  return Number.isFinite(n) ? n : id;
}

export const baseUrl = BASE_URL;

// Aggregate default export at end to avoid hoist/ordering lint complaints
const relationalApi = {
  baseUrl: BASE_URL,
  listSubjects,
  getSubject,
  listModulesBySubject,
  listModules,
  getModule,
  listLessonsByModule,
  getLesson,
  listActivitiesByLesson,
  getUserProgress,
  getLessonProgressForUser,
  markLessonComplete,
};

export default relationalApi;
