import React from "react";
import config from "../config/env";
import { baseUrl as relationalBase } from "../api/relationalClient";
import { baseUrl as catalogBase } from "../api/catalogClient";

/**
 * PUBLIC_INTERFACE
 * BackendHelp - Frontend helper page to validate API base URL, common routes, and CORS notes.
 * Route: /__backend_help (mirrors backend helper for convenience)
 */
export default function BackendHelp() {
  const apiBase = config.apiBaseUrl || relationalBase || catalogBase;
  return (
    <section className="card" style={{ padding: "1rem" }} aria-label="Backend Help">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>Backend Help</h1>
        <p style={{ color: "var(--muted)" }}>
          Use these links to quickly verify the backend is up, CORS is configured, and data is seeded.
        </p>
      </header>
      <div className="card" style={{ padding: "1rem" }}>
        <p style={{ marginTop: 0 }}>
          API base (from env): <code>{apiBase}</code>
        </p>
        <ul style={{ margin: "0.5rem 0", paddingLeft: "1.25rem" }}>
          <li><a href={`${apiBase}/`} target="_blank" rel="noreferrer">/ (health)</a></li>
          <li><a href={`${apiBase}/docs`} target="_blank" rel="noreferrer">/docs</a></li>
          <li><a href={`${apiBase}/__backend_help`} target="_blank" rel="noreferrer">/__backend_help (backend)</a></li>
          <li><a href={`${apiBase}/skills`} target="_blank" rel="noreferrer">/skills</a> (relational)</li>
          <li><a href={`${apiBase}/content/skills`} target="_blank" rel="noreferrer">/content/skills</a> (catalog)</li>
          <li><a href={`${apiBase}/subjects`} target="_blank" rel="noreferrer">/subjects</a></li>
          <li><a href={`${apiBase}/modules?subject_id=1`} target="_blank" rel="noreferrer">/modules?subject_id=1</a></li>
          <li><a href={`${apiBase}/lessons?module_id=1`} target="_blank" rel="noreferrer">/lessons?module_id=1</a></li>
          <li><a href={`${apiBase}/__run_seeds`} target="_blank" rel="noreferrer">/__run_seeds</a> (run seeds)</li>
        </ul>
        <p style={{ marginTop: "0.5rem", color: "var(--muted)" }}>
          Ensure backend CORS allows http://localhost:3000 and allow_credentials=true.
        </p>
      </div>
    </section>
  );
}
