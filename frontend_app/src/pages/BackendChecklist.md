# Backend Verification Checklist (for local E2E)

Use this quick checklist if your frontend shows empty states or "Failed to fetch".

1) Confirm backend routes respond with 200:
   - GET http://localhost:3001/skills
   - GET http://localhost:3001/content/skills
   - GET http://localhost:3001/subjects
   - GET http://localhost:3001/subjects/1/modules (replace 1 with an existing subject id)
   - GET http://localhost:3001/modules/1/lessons (replace 1 with an existing module id)

2) Confirm CORS:
   - Backend must include CORS allow origin: http://localhost:3000
   - allow_credentials must be true
   - OPTIONS requests should succeed

3) Seed the backend (if lists are empty):
   - cd skillmaster-learning-platform-223450-222247
   - PYTHONPATH=backend python3 -m src.seeds.run_all_seeds

4) Frontend pages to verify:
   - http://localhost:3000/skills → list of skills (uses /content/skills then falls back to /skills)
   - http://localhost:3000/subjects → list of subjects
   - http://localhost:3000/subjects/:id/modules → modules for subject
   - http://localhost:3000/modules/:id/lessons → lessons for module
   - http://localhost:3000/learn/:lessonId → player; GET/POST progress endpoints

5) Friendly fallbacks:
   - All pages show alerts on errors but continue rendering where possible.
   - Empty responses render "No X found" messages rather than blank pages.
