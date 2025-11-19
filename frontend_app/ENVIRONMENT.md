# Frontend Environment and Routes

This frontend consumes the backend catalog and relational APIs.

## Environment

- REACT_APP_API_BASE: Preferred base URL of backend (FastAPI). Example: http://localhost:3001
  - Note: Frontend uses fetch with credentials: 'include'. Ensure your backend CORS allows http://localhost:3000 and allow_credentials=true.
- REACT_APP_BACKEND_URL: Legacy/alternate base URL, used if API_BASE not set.
  - If neither is set, the app defaults to http://localhost:3001.
  - Tip: When running locally, keep ports aligned with CORS config: frontend 3000, backend 3001.

Copy .env.example to .env and adjust as needed.
Important:
- The frontend includes credentials: 'include' on all fetches.
- Ensure the FastAPI backend CORS allows origin http://localhost:3000 and allow_credentials=True.
- You can verify backend is seeded and routes respond:
  - http://localhost:3001/__run_seeds (if available)
  - http://localhost:3001/skills
  - http://localhost:3001/content/skills
  - http://localhost:3001/subjects
  - http://localhost:3001/subjects/1/modules
  - http://localhost:3001/modules/1/lessons
- From the frontend, visit http://localhost:3000/__backend_help for quick diagnostics.

CORS requirements:
- Backend must allow origin http://localhost:3000
- allow_credentials must be true (frontend includes credentials: 'include' on fetch)
- Ensure the backend runs at http://localhost:3001 (default) or adjust REACT_APP_API_BASE.
- Verify with: curl -i http://localhost:3001/

## Core Routes

- /                      Dashboard
- /skills                Skills list with filters and pagination (query: category, page)
- /skills/:slug          Skill detail showing lessons (new)
- /lessons/:id           Lesson detail with content and a simple 3-question quiz (new)
- /learn/:lessonId       Legacy lesson player (kept for compatibility)
- /progress              User progress

## Catalog API Client

Located at src/api/catalogClient.js providing:
- fetchSkills({ category, limit, offset })
- fetchSkillBySlug(slug)
- fetchLessonsBySkillSlug(slug)
- fetchLessonById(id, { skillSlug })
