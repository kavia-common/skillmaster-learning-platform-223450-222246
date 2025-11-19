# PUBLIC_INTERFACE
# Frontend ⇄ Backend Integration Checklist

- Environment:
  - Copy .env.example to .env
  - Ensure REACT_APP_API_BASE=http://localhost:3001
- CORS (FastAPI):
  - allow_origins includes http://localhost:3000
  - allow_credentials=True
- Seeding:
  - Backend: PYTHONPATH=backend python3 -m src.seeds.run_all_seeds
  - Or GET http://localhost:3001/__run_seeds
- Manual endpoint checks (200 expected, non-empty after seeding):
  - GET /skills
  - GET /content/skills
  - GET /subjects
  - GET /subjects/{id}/modules
  - GET /modules/{id}/lessons
- Frontend verification:
  - /skills (lists skills; fetches with credentials)
  - /subjects → /subjects/:id/modules → /modules/:id/lessons
  - /learn/:lessonId (GET/POST progress)
- Troubleshooting:
  - Visit /__backend_help for quick links and current API base.
