import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../state/store';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * PUBLIC_INTERFACE
 * SkillsCatalog - Lists available micro-skills with simple search/filter placeholders.
 * Now wired to backend:
 *   GET /skills -> [{id, name, description, tags}]
 *
 * Smoke path (manual):
 * 1) Start backend (FastAPI) on :3001 and frontend on :3000.
 * 2) Open /skills, expect a loading indicator, then cards populated from /skills data.
 * 3) Click "View Skill" to navigate to /skills/:id which fetches the detail.
 */
export default function SkillsCatalog() {
  const { state, actions, api } = useAppState();
  const [skills, setSkills] = useState([]);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return skills;
    return skills.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      (Array.isArray(s.tags) && s.tags.some(t => t.toLowerCase().includes(q)))
    );
  }, [skills, query]);

  useEffect(() => {
    let isMounted = true;
    actions.setLoading(true);
    actions.clearError();
    api.get('/skills')
      .then(res => {
        if (!isMounted) return;
        setSkills(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        if (!isMounted) return;
        actions.setError(err.message || 'Failed to load skills');
      })
      .finally(() => {
        if (isMounted) actions.setLoading(false);
      });
    return () => { isMounted = false; };
  }, [api, actions]);

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
          marginBottom: '.75rem'
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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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

      {state.ui.error && (
        <div role="alert" className="card" style={{ padding: '.75rem', borderColor: 'var(--error)' }}>
          <strong style={{ color: 'var(--error)' }}>Error:</strong>{' '}
          <span>{String(state.ui.error)}</span>
        </div>
      )}

      {state.ui.loading ? (
        <LoadingSpinner label="Loading skills" />
      ) : (
        <div
          role="list"
          aria-label="Skill list"
          className="grid-autofit"
        >
          {filtered.map((s) => (
            <article key={s.id} role="listitem" className="card" style={{ padding: '1rem' }}>
              <h2 style={{ margin: '0 0 .5rem', fontSize: '1rem' }}>{s.name}</h2>
              <p style={{ margin: '0 0 1rem', color: 'var(--muted)' }}>
                {s.description || 'No description'}
              </p>
              <Link
                className="btn"
                to={`/skills/${encodeURIComponent(s.id)}`}
                aria-label={`View details for ${s.name}`}
              >
                View Skill
              </Link>
            </article>
          ))}
          {!filtered.length && !state.ui.error && (
            <div className="card" style={{ padding: '1rem' }}>
              <p className="empty-state" style={{ margin: 0 }}>No skills found.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
