import React from "react";
import config from "../config/env";

/**
 * PUBLIC_INTERFACE
 * BackendHelp - Quick links and guidance to verify backend connectivity, CORS, and seeding.
 * Use this when seeing "Failed to fetch" or empty lists to verify configuration quickly.
 */
export default function BackendHelp() {
  const base = (config.apiBaseUrl || "").replace(/\/+$/, "");
  const checks = [
    { path: "/", label: "Health (/)" },
    { path: "/docs", label: "OpenAPI Docs (/docs)" },
    { path: "/__run_seeds", label: "Run Seeds Helper (/__run_seeds)" },
    { path: "/skills", label: "Relational Skills (/skills)" },
    { path: "/content/skills", label: "Catalog Skills (/content/skills)" },
    { path: "/subjects", label: "Subjects (/subjects)" },
    { path: "/subjects/1/modules", label: "Modules by Subject (/subjects/{id}/modules)" },
    { path: "/modules", label: "Modules (/modules)" },
    { path: "/modules/1/lessons", label: "Lessons by Module (/modules/{id}/lessons)" },
  ];

  return (
    <section className="card" style={{ padding: "1rem" }} aria-label="Backend Help">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>Backend Connectivity Help</h1>
        <p>API Base: <code>{base}</code></p>
        <p style={{ color: "var(--muted)" }}>
          This backend is configured to allow CORS from <code>http://localhost:3000</code> with
          <code> allow_credentials=true</code>. If requests still fail, verify your environment variables and that the backend is running.
        </p>
      </header>

      <ol>
        <li>
          Ensure backend is running. OpenAPI should load at{" "}
          <a href={`${base}/docs`} target="_blank" rel="noreferrer">
            {base}/docs
          </a>.
        </li>
        <li>
          Confirm CORS allows <code>http://localhost:3000</code> and that credentials are included in requests.
          The frontend uses <code>credentials="include"</code> in fetch. If running on a different host/port, update
          <code> REACT_APP_API_BASE</code>/<code>REACT_APP_BACKEND_URL</code>.
        </li>
        <li>
          Seed data if lists are empty:
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "var(--surface-2)",
              padding: ".75rem",
              borderRadius: 8,
              marginTop: ".5rem",
            }}
          >{`cd skillmaster-learning-platform-223450-222247
PYTHONPATH=backend python3 -m src.seeds.run_all_seeds`}</pre>
          Tip: You can also set <code>SEED_RELATIONAL_DATA=true</code> before starting the FastAPI server to seed automatically on startup.
        </li>
        <li>
          See <code>frontend_app/README.md</code> and <code>BackendChecklist.md</code> for more notes.
        </li>
      </ol>

      <div className="card" role="region" aria-label="Quick links" style={{ padding: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Quick links</h2>
        <ul>
          {checks.map((c) => (
            <li key={c.path}>
              <a href={`${base}${c.path}`} target="_blank" rel="noreferrer">
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
