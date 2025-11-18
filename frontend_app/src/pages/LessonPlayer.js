import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAppState } from '../state/store';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * PUBLIC_INTERFACE
 * LessonPlayer - Hosts interactive lesson content with basic transport controls and progress updates.
 * Uses route param `lessonId`.
 *
 * Backend endpoints used:
 *   GET /progress/{user_id}/lesson/{lesson_id}
 *   POST /progress/complete
 *
 * Smoke path (manual):
 * - Navigate here from a skill detail lesson link; the page fetches any prior progress for the lesson.
 * - Click "Complete" to POST completion; expect a "Saved!" confirmation after success.
 */
export default function LessonPlayer() {
  const { lessonId } = useParams();
  const location = useLocation();
  const { state, actions, api } = useAppState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [entries, setEntries] = useState([]);
  const [savedMsg, setSavedMsg] = useState('');

  const { skillId, moduleId, lessonTitle } = useMemo(() => ({
    skillId: location.state?.skillId || '',
    moduleId: location.state?.moduleId || '',
    lessonTitle: location.state?.lessonTitle || '',
  }), [location.state]);

  useEffect(() => {
    let isMounted = true;
    actions.setLoading(true);
    actions.clearError();
    api.get(`/progress/${encodeURIComponent(state.currentUser.id)}/lesson/${encodeURIComponent(lessonId)}`)
      .then(res => {
        if (!isMounted) return;
        setEntries(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        if (!isMounted) return;
        // Not fatal; show error banner but allow playing
        actions.setError(err.message || 'Failed to load lesson progress');
      })
      .finally(() => {
        if (isMounted) actions.setLoading(false);
      });
    return () => { isMounted = false; };
  }, [lessonId, api, actions, state.currentUser.id]);

  const handleComplete = async () => {
    setSavedMsg('');
    actions.setLoading(true);
    actions.clearError();
    try {
      const body = {
        user_id: state.currentUser.id,
        skill_id: skillId || 'unknown-skill',
        module_id: moduleId || 'unknown-module',
        lesson_id: lessonId,
        score: null
      };
      const res = await api.post('/progress/complete', body);
      if (res?.data?.entry) {
        setEntries(prev => [res.data.entry, ...prev]);
        setSavedMsg('Saved!');
        setTimeout(() => setSavedMsg(''), 1500);
      }
    } catch (err) {
      actions.setError(err.message || 'Failed to save progress');
    } finally {
      actions.setLoading(false);
    }
  };

  return (
    <section className="card" style={{ padding: '1rem' }} aria-label="Lesson Player">
      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>Lesson</h1>
        <p style={{ color: 'var(--muted)' }}>
          Lesson ID: <strong>{lessonId}</strong>{' '}
          {lessonTitle ? <>— <em>{lessonTitle}</em></> : null}
        </p>
      </header>

      {state.ui.error && (
        <div role="alert" className="card" style={{ padding: '.75rem', borderColor: 'var(--error)' }}>
          <strong style={{ color: 'var(--error)' }}>Error:</strong>{' '}
          <span>{String(state.ui.error)}</span>
        </div>
      )}

      <div
        className="card"
        role="region"
        aria-label="Lesson content"
        style={{
          padding: '1rem',
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          background: 'var(--gradient-bg)'
        }}
      >
        {state.ui.loading ? (
          <LoadingSpinner label="Loading lesson" />
        ) : (
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Interactive content will appear here.
          </p>
        )}
      </div>

      <div role="group" aria-label="Lesson controls" style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
        <button
          className="btn"
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          aria-pressed={isPlaying}
          aria-label={isPlaying ? 'Pause lesson' : 'Play lesson'}
        >
          {isPlaying ? '⏸ Pause' : '▶️ Play'}
        </button>
        <button className="btn" type="button" aria-label="Previous step">
          ⏮ Prev
        </button>
        <button className="btn" type="button" aria-label="Next step">
          ⏭ Next
        </button>
        <button
          className="btn"
          type="button"
          aria-label="Mark complete"
          onClick={handleComplete}
          style={{ marginLeft: 'auto', background: 'var(--success)' }}
        >
          ✅ Complete
        </button>
        {savedMsg && <span aria-live="polite" style={{ color: 'var(--muted)' }}>{savedMsg}</span>}
      </div>

      <div className="card" role="region" aria-label="Previous attempts" style={{ padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Attempts</h2>
        {entries.length === 0 ? (
          <p className="empty-state">No attempts yet.</p>
        ) : (
          <ul style={{ marginTop: '.5rem' }}>
            {entries.map(e => (
              <li key={e.id || e.timestamp} style={{ margin: '.25rem 0' }}>
                {e.timestamp ? new Date(e.timestamp).toLocaleString() : '—'} — {e.completed ? 'Completed' : 'In progress'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
