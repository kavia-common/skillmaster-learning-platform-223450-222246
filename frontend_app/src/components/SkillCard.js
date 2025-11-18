import React from "react";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * SkillCard - Compact card view for a skill summary.
 *
 * @param {object} props
 * @param {object} props.skill - Skill data (expects id/slug, name, description, category, difficulty, points).
 */
export default function SkillCard({ skill }) {
  const {
    id,
    slug,
    name,
    description,
    category,
    difficulty = "Beginner",
    points = 25,
  } = skill || {};

  const to = `/skills/${encodeURIComponent(slug || id)}`;

  return (
    <article className="card" role="listitem" style={{ padding: "1rem" }}>
      <header style={{ marginBottom: ".5rem" }}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>{name || slug || id}</h2>
        <div style={{ display: "flex", gap: ".5rem", marginTop: ".4rem", flexWrap: "wrap" }}>
          {category ? (
            <span
              className="card"
              style={{
                padding: ".15rem .5rem",
                fontSize: ".75rem",
                background: "var(--surface-2)",
              }}
            >
              {category}
            </span>
          ) : null}
          <span
            className="card"
            style={{
              padding: ".15rem .5rem",
              fontSize: ".75rem",
              background: "var(--primary-100)",
              border: "1px solid rgba(37,99,235,0.25)",
            }}
          >
            {difficulty}
          </span>
          <span
            className="card"
            style={{
              padding: ".15rem .5rem",
              fontSize: ".75rem",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
            }}
          >
            ⭐ {points}
          </span>
        </div>
      </header>
      <p style={{ color: "var(--muted)", margin: "0 0 1rem" }}>
        {description || "No description"}
      </p>
      <Link className="btn" to={to} aria-label={`Details for ${name || slug || id}`}>
        View Skill
      </Link>
    </article>
  );
}
