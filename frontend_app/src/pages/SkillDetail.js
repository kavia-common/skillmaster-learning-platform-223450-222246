import React from 'react';
import { useParams, Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * SkillDetail - Shows a specific skill's details and its lessons.
 * Uses the route param `skillId`.
 */
export default function SkillDetail() {
  const { skillId } = useParams();

  return (
    <section className="card" style={{ padding: '1rem' }} aria-label="Skill Detail">
      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>Skill Detail</h1>
        <p style={{ color: 'var(--muted)' }}>
          Details for Skill ID: <strong>{skillId}</strong> (Placeholder)
        </p>
      </header>

      <div className="card" role="region" aria-label="Skill summary" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Overview</h2>
        <p>
          This section will include skill description, estimated time, difficulty, and tags.
        </p>
      </div>

      <div className="card" role="region" aria-label="Lessons" style={{ padding: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Lessons</h2>
        <ul style={{ marginTop: '.5rem' }}>
          {[1, 2, 3].map((i) => (
            <li key={i} style={{ margin: '.5rem 0' }}>
              <Link className="btn" to={`/learn/${skillId}-${i}`} aria-label={`Start lesson ${i}`}>
                ▶️ Start Lesson {i}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
