import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../state/store';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchSkills as fetchCatalogSkills, runSeeds as runCatalogSeeds, baseUrl as apiBaseUrl } from '../api/catalogClient';

/**
 * PUBLIC_INTERFACE
 * SkillsCatalog - Lists available micro-skills with simple search/filter placeholders.
 * Uses corrected endpoints via catalogClient: /skills (preferred) with fallback /content/skills.
 */
export default function SkillsCatalog() {
  const { state, actions } = useAppState();
  const [skills, setSkills] = useState([]);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return Array.isArray(skills) ? skills : [];
    return (Array.isArray(skills) ? skills : []).filter((s) => {
      const name = (s?.name || s?.title || '').toLowerCase();
      const desc = (s?.description || '').toLowerCase();
      const tags = Array.isArray(s?.tags) ? s.tags.map(String) : [];
      return (
        name.includes(q) ||
        desc.includes(q) ||
        tags.some((t) => String(t || '').toLowerCase().includes(q))
      );
    });
  }, [skills, query]);

  const loadSkills = () => {
    actions.setLoading(true);
    actions.clearError();
    return fetchCatalogSkills({ limit: 24, offset: 0 })
      .then((result) => {
        const arr = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
        setSkills(arr.filter(Boolean));
      })
      .catch((err) => {
        actions.setError(err?.message || 'Failed to load skills');
        setSkills([]);
      })
      .finally(() => {
        actions.setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    loadSkills().finally(() => { if (!isMounted) return; });
    return () => { isMounted = false; };
  }, [actions]);

  return (
    <section className="card" style={{ padding: '1rem' }} aria-label="Skills Catalog">
      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>Skills</h1>
        <p style={{ color: 'var(--muted)' }}>
          Browse available micro-skills. Use search to find skills quickly.
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

      {state.ui.error ? (
        <div role="alert" className="card" style={{ padding: '.75rem', borderColor: 'var(--error)' }}>
          <strong style={{ color: 'var(--error)' }}>Error:</strong>{' '}
          <span>{String(state.ui.error)}</span>
        </div>
      ) : null}

      {state.ui.loading ? (
        <LoadingSpinner label="Loading skills" />
      ) : (
        <div role="list" aria-label="Skill list" className="grid-autofit">
          {(filtered || []).map((s, idx) => {
            const idOrSlug = s?.id ?? s?.slug ?? s?.name ?? idx;
            const name = s?.name || s?.title || idOrSlug;
            const desc = s?.description || 'No description';
            return (
              <article key={idOrSlug} role="listitem" className="card" style={{ padding: '1rem' }}>
                <h2 style={{ margin: '0 0 .5rem', fontSize: '1rem' }}>{name}</h2>
                <p style={{ margin: '0 0 1rem', color: 'var(--muted)' }}>{desc}</p>
                <Link
                  className="btn"
                  to={`/skills/${encodeURIComponent(idOrSlug)}`}
                  aria-label={`View details for ${name}`}
                >
                  View Skill
                </Link>
              </article>
            );
          })}
          {!filtered?.length && !state.ui.error && (
            <div className="card" style={{ padding: '1rem' }}>
              <p className="empty-state" style={{ margin: 0 }}>
                No skills found. Try clearing search.
              </p>
              <p style={{ margin: '.5rem 0 0', color: 'var(--muted)' }}>
                Backend API base: <code>{apiBaseUrl}</code>
              </p>
              <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={async () => {
                    const ok = await runCatalogSeeds();
                    if (ok) {
                      await loadSkills();
                    } else {
                      actions.setError('Seeding failed. See backend logs or open /__backend_help.');
                    }
                  }}
                >
                  Seed data and reload
                </button>
                <a className="btn btn-secondary" href={`${apiBaseUrl}/__backend_help`} target="_blank" rel="noreferrer">
                  Backend Help
                </a>
              </div>
              <p style={{ margin: '.5rem 0 0', color: 'var(--muted)' }}>
                Manual seed: <code>PYTHONPATH=backend python3 -m src.seeds.run_all_seeds</code>
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
