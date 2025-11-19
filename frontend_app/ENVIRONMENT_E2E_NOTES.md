# Frontend ↔ Backend E2E Notes

This document summarizes how to run and verify the end-to-end experience locally.

## Backend (FastAPI)

- Base URL (default): http://localhost:3001
- CORS: Configured to allow http://localhost:3000 with credentials.
- OpenAPI: http://localhost:3001/docs

Seeding data:
- The backend initializes tables on startup.
- To seed relational/content data explicitly, run from the project root:
  - Using env var on startup (recommended when starting FastAPI):
    - Set SEED_RELATIONAL_DATA=true in the backend environment before launching the server
  - Using the CLI (ensure Python path includes `backend`):
    - From skillmaster-learning-platform-223450-222247/
      - `PYTHONPATH=backend python3 -m src.seeds.run_all_seeds`
    - This will print counts for subjects, skills, modules, lessons, activities, and quizzes.
- Quick verification after seeding:
  - curl -i http://localhost:3001/subjects
  - curl -i http://localhost:3001/modules
  - curl -i http://localhost:3001/skills
  - curl -i "http://localhost:3001/modules/1/lessons?page=1&page_size=5"

## Frontend (React)

- Base URL Discovery:
  - `REACT_APP_API_BASE` or `REACT_APP_BACKEND_URL`, defaults to http://localhost:3001
- Frontend dev server: http://localhost:3000

Core endpoints consumed:
- Catalog (Mongo-backed):
  - GET /content/skills (fallback to GET /skills)
  - GET /content/skills/{slug}
  - GET /content/skills/{slug}/lessons
  - GET /content/lessons/{id}
- Relational:
  - GET /subjects, /subjects/{id}, /subjects/{id}/modules
  - GET /modules, /modules/{id}, /modules/{id}/lessons
  - GET /lessons/{id}
- Progress:
  - GET /progress/{user_id}
  - GET /progress/{user_id}/lesson/{lesson_id}
  - POST /progress/complete

Pages:
- /skills -> Skills list (SkillsList)
- /skills/:skillId -> Skill detail (legacy, ID-based)
- /lessons/:id -> Lesson detail (catalog variant)
- /rel/lessons/:lessonId -> Lesson detail (relational variant)
- /subjects -> Subjects list
- /subjects/:subjectId/modules -> Modules list
- /modules/:moduleId/lessons -> Lessons list
- /learn/:lessonId -> Legacy player (uses /progress endpoints)

Fallback UX:
- All pages include graceful error and empty-state rendering. If a 404 is returned or an API call fails, the page shows a friendly alert and continues rendering where possible.

Tip:
- Ensure the backend is reachable and seeded for a rich demo experience, otherwise the frontend will render empty states.
