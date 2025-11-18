import React from 'react';

/**
 * PUBLIC_INTERFACE
 * SkillsCatalog - Lists available micro-skills with simple search/filter placeholders.
 * Structured to integrate with future API calls.
 */
export default function SkillsCatalog() {
  return (
    <section className="card" style={{ padding: '1rem' }} aria-label="Skills Catalog">
      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>Skills</h1>
        <p style={{ color: 'var(--muted)' }}>
          Browse available micro-skills. Use search and filters to find skills quickly.
        </p>
      </header>

      <form
        role="search"
        aria-label="Skill search"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '.5rem',
          marginBottom: '1rem'
        }}
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="visually-hidden" htmlFor="skill-search-input">
          Search skills
        </label>
        <input
          id="skill-search-input"
          type="search"
          placeholder="Search skills..."
          aria-label="Search skills"
          style={{
            padding: '.6rem .75rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)'
          }}
        />
        <button className="btn" type="submit" aria-label="Search">
          🔎 Search
        </button>
      </form>

      <div
        role="list"
        aria-label="Skill list"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <article key={i} role="listitem" className="card" style={{ padding: '1rem' }}>
            <h2 style={{ margin: '0 0 .5rem', fontSize: '1rem' }}>Skill #{i}</h2>
            <p style={{ margin: '0 0 1rem', color: 'var(--muted)' }}>
              Short description for skill #{i}. (Placeholder)
            </p>
            <a
              className="btn"
              href={`/skills/${i}`}
              aria-label={`View details for Skill ${i}`}
            >
              View Skill
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
