# Frontend Environment and Routes

This frontend consumes the backend catalog APIs.

## Environment

- REACT_APP_BACKEND_URL: Base URL of backend (FastAPI). Example: http://localhost:3001
  - If not set, the app falls back to `window.location.origin` and swaps port 3000 -> 3001 for local preview.

Copy .env.example to .env and adjust as needed.

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
