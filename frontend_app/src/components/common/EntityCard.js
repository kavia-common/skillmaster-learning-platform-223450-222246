import React from "react";

/**
 * PUBLIC_INTERFACE
 * EntityCard - Generic card for list items (subject/module/lesson).
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.actions] - Primary action (e.g., a Link/button)
 * @param {React.ReactNode} [props.meta] - Optional metadata section (chips, stats)
 */
export default function EntityCard({ title, description, actions, meta }) {
  return (
    <article className="card" role="listitem" style={{ padding: "1rem" }}>
      <header style={{ marginBottom: ".5rem" }}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>{title}</h2>
        {meta ? <div style={{ marginTop: ".35rem" }}>{meta}</div> : null}
      </header>
      {description ? (
        <p style={{ margin: "0 0 1rem", color: "var(--muted)" }}>{description}</p>
      ) : null}
      <div className="card-footer" style={{ display: "flex", gap: ".5rem" }}>{actions}</div>
    </article>
  );
}
