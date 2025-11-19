# End-to-End Verification Notes

1) Backend up:
- Start FastAPI at http://localhost:3001 (uvicorn src.api.main:app --port 3001 --reload)
- CORS should include http://localhost:3000 with allow_credentials=true (already configured in src/api/main.py)

2) Seed relational/content data:
- From backend repo root:
  PYTHONPATH=backend python3 -m src.seeds.run_all_seeds
- Or hit the helper endpoint in a browser:
  http://localhost:3001/__run_seeds

CORS:
- Confirm FastAPI includes CORSMiddleware with:
  allow_origins=["http://localhost:3000"], allow_credentials=True,
  allow_methods=["*"], allow_headers=["*"]

3) Manual endpoint checks (expect HTTP 200):
- http://localhost:3001/skills
- http://localhost:3001/content/skills
- http://localhost:3001/subjects
- http://localhost:3001/subjects/1/modules
- http://localhost:3001/modules/1/lessons

4) Frontend env:
- Copy .env.example to .env
- Ensure REACT_APP_API_BASE=http://localhost:3001

5) Frontend run:
- npm start (http://localhost:3000)
- Visit:
  - /skills
  - /subjects
  - /subjects/:id/modules
  - /modules/:id/lessons
  - /lessons/:id and /learn/:id

If you see empty listings, confirm seeds ran and check Backend Help at /__backend_help.
