# Backend Integration Checklist (Runtime Fixes)

This project consumes the FastAPI backend running on port 3001. Follow these final steps to eliminate "Failed to fetch" and ensure content is visible:

1) Health and OpenAPI verification
- Confirm: GET http://localhost:3001/health (or GET http://localhost:3001/) returns 200 JSON.
- Confirm: GET http://localhost:3001/openapi.json returns 200 JSON.
- If deployed, use the actual backend base (REACT_APP_API_BASE).

2) CORS configuration (FastAPI)
- If you see CORS errors or preflight failures:
  - Add CORSMiddleware with explicit allow_origins for the exact frontend origin. Do not use "*" with credentials.
  Example:
  from fastapi.middleware.cors import CORSMiddleware

  app.add_middleware(
      CORSMiddleware,
      allow_origins=[
          "http://localhost:3000",
          "https://vscode-internal-12504-beta.beta01.cloud.kavia.ai:3000",
      ],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )

- After changing CORS, restart the backend.

3) Seeding data so lists are not empty
- Ensure a callable run_all_seeds() exists in backend seeding module.
- Invoke seeding once at startup (safe idempotent). Example in FastAPI:
  @app.on_event("startup")
  async def seed_on_startup():
      try:
          from app.seeds import run_all_seeds
          await run_all_seeds() if asyncio.iscoroutinefunction(run_all_seeds) else run_all_seeds()
      except Exception as exc:
          logger.warning("Seeding failed or already applied: %s", exc)

- After seeding, verify that:
  - GET /content/skills returns non-empty items
  - GET /subjects returns non-empty items

4) Frontend environment variables
- Set one of:
  - REACT_APP_API_BASE=http://localhost:3001
  - OR REACT_APP_BACKEND_URL=http://localhost:3001
- Restart the frontend if env vars changed.

5) Endpoint alignment (used by this UI)
- Catalog:
  - GET /content/skills
  - GET /content/skills/{slug}
  - GET /content/skills/{slug}/lessons
  - GET /content/lessons/{slug}
- Relational:
  - GET /subjects
  - GET /modules
  - GET /skills

6) Diagnostics in UI
- SkillsProgress and SubjectsList now log:
  - API base and request path
  - A consolidated fix hint when "Failed to fetch" occurs

If any issues persist, open browser DevTools → Network, check the failing request URL, response code, and CORS headers, then adjust CORS allow_origins accordingly.
