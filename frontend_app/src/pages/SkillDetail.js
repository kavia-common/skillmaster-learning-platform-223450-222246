import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppState } from '../state/store';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * PUBLIC_INTERFACE
 * SkillDetail - Shows a specific skill's details and its lessons.
 * Uses the route param `skillId`.
 *
 * Backend endpoints used:
 *   GET /skills/{skill_id} -> SkillDetail with modules and lessons
 *
 * Smoke path (manual):
 * - From /skills click a skill card; page should load detail with modules/lessons.
 * - Click a lesson to open LessonPlayer which can POST completion.
 */
export default function SkillDetail() {
  const { skillId } = useParams();
  const { state, actions, api } = useAppState();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let isMounted = true;
    actions.setLoading(true);
    actions.clearError();
    api.get(`/skills/${encodeURIComponent(skillId)}`)
      .then(res => {
        if (!isMounted) return;
        setDetail(res.data || null);
      })
      .catch(err => {
        if (!isMounted) return;
        actions.setError(err.message || 'Failed to load skill');
      })
      .finally(() => {
        if (isMounted) actions.setLoading(false);
      });
    return () => { isMounted = false; };
  }, [skillId, api, actions]);

  const lessons = useMemo(() => {
    if (!detail?.modules) return [];
    // Flatten module lessons and keep reference to module
    return detail.modules.flatMap(m =>
      (m.lessons || []).map(lsn => ({ ...lsn, module_id: m.id, module_title: m.title }))
    );
  }, [detail]);

  return (
    <section className="card" style={{ padding: '1rem' }} aria-label="Skill Detail">
      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>{detail?.name || 'Skill Detail'}</h1>
        <p style={{ color: 'var(--muted)' }}>
          {detail?.description || <>Details for Skill ID: <strong>{skillId}</strong></>}
        </p>
        {Array.isArray(detail?.tags) && detail.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginTop: '.5rem' }}>
            {detail.tags.map(tag => (
              <span key={tag} className="card" style={{ padding: '.2rem .5rem', fontSize: '.8rem' }}>{tag}</span>
            ))}
          </div>
        )}
      </header>

      {state.ui.error && (
        <div role="alert" className="card" style={{ padding: '.75rem', borderColor: 'var(--error)' }}>
          <strong style={{ color: 'var(--error)' }}>Error:</strong>{' '}
          <span>{String(state.ui.error)}</span>
        </div>
      )}

      {state.ui.loading ? (
        <LoadingSpinner label="Loading skill" />
      ) : (
        <>
          <div className="card" role="region" aria-label="Skill summary" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Overview</h2>
            <p>
              {detail?.description || 'This section will include skill description, estimated time, difficulty, and tags.'}
            </p>
          </div>

          <div className="card" role="region" aria-label="Lessons" style={{ padding: '1rem' }}>
            <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Lessons</h2>
            <ul style={{ marginTop: '.5rem' }}>
              {lessons.map((lsn) => (
                <li key={lsn.id} style={{ margin: '.5rem 0' }}>
                  <Link
                    className="btn"
                    to={`/learn/${encodeURIComponent(lsn.id)}`}
                    aria-label={`Start lesson ${lsn.title || lsn.id}`}
                    state={{ // pass helpful info to player
                      skillId: detail?.id,
                      moduleId: lsn.module_id,
                      lessonTitle: lsn.title,
                    }}
                  >
                    ▶️ Start {lsn.title || lsn.id}
                  </Link>
                </li>
              ))}
              {!lessons.length && <li style={{ color: 'var(--muted)' }}>No lessons available.</li>}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
