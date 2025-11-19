import React from "react";
import config from "../config/env";

/**
 * PUBLIC_INTERFACE
 * BackendHelp - simple helper page with links and checks for backend readiness.
 * Use this when seeing "Failed to fetch" to quickly verify base URL and CORS.
 */
export default function BackendHelp() {
  const base = config.apiBaseUrl;
  const checks = [
    { path: "/", label: "Health (/)" },
    { path: "/skills", label: "Skills (/skills)" },
    { path: "/content/skills", label: "Catalog Skills (/content/skills)" },
    { path: "/content/skills/test-skill", label: "Sample Skill by Slug (/content/skills/{slug})" },
    { path: "/subjects", label: "Subjects (/subjects)" },
    { path: "/modules", label: "Modules (/modules)" },
    { path: "/subjects/1/modules", label: "Modules by Subject (/subjects/{id}/modules)" },
    { path: "/modules/1/lessons", label: "Lessons by Module (/modules/{id}/lessons)" },
  ];
  return (
    <section className="card" style={{ padding: "1rem" }} aria-label="Backend Help">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>Backend Connectivity Help</h1>
        <p style={{ color: "var(--muted)" }}>
          Base URL: <code>{base}</code>
        </p>
      </header>
      <ol>
        <li>
          Ensure the backend is running at the base URL above (OpenAPI should load at{" "}
          <a href={`${base}/docs`} target="_blank" rel="noreferrer">
            {base}/docs
          </a>
          ).
        </li>
        <li>
          Confirm CORS allows <code>http://localhost:3000</code> with credentials. Backend must set{" "}
          <code>allow_credentials=true</code> and include the origin in allowed origins.
        </li>
        <li>
          Seed data if lists are empty:
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "var(--surface-2)",
              padding: ".75rem",
              borderRadius: 8,
            }}
          >{`cd skillmaster-learning-platform-223450-222247
PYTHONPATH=backend python3 -m src.seeds.run_all_seeds`}</pre>
          Tip: If running the backend with env vars, you can also set <code>SEED_RELATIONAL_DATA=true</code> before startup.
        </li>
        <li>
          See also: local project doc at <code>frontend_app/src/pages/BackendChecklist.md</code>.
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
