import React, { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAppState } from '../state/store';

/**
 * PUBLIC_INTERFACE
 * Progress - Displays user progress metrics, streaks, and achievements.
 * Now fetches aggregated progress from backend: GET /progress/{user_id}
 *
 * Smoke path (manual):
 * - Visit /progress; a loading indicator shows, then the stats update from API.
 * - Completing a lesson in LessonPlayer then returning here should reflect new totals.
 */
export default function Progress() {
  const { state, actions, api } = useAppState();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    let isMounted = true;
    actions.setLoading(true);
    actions.clearError();
    api.get(`/progress/${encodeURIComponent(state.currentUser.id)}`)
      .then(res => {
        if (!isMounted) return;
        const list = res?.data?.progress?.entries || [];
        setEntries(Array.isArray(list) ? list : []);
      })
      .catch(err => {
        if (!isMounted) return;
        actions.setError(err.message || 'Failed to load progress');
      })
      .finally(() => {
        if (isMounted) actions.setLoading(false);
      });
    return () => { isMounted = false; };
  }, [api, actions, state.currentUser.id]);

  const computed = useMemo(() => {
    const completed = entries.filter(e => e.completed).length;
    const uniqueSkills = new Set(entries.map(e => e.skill_id)).size;
    // Placeholder streak logic: count distinct dates with any completion
    const completedDates = new Set(
      entries
        .filter(e => e.completed && e.timestamp)
        .map(e => new Date(e.timestamp).toDateString())
    );
    const streak = Math.min( completedDates.size, 5 ); // simple cap for demo
    return { totalSkills: uniqueSkills, completedLessons: completed, streak };
  }, [entries]);

  return (
    <section className="card" style={{ padding: '1rem' }} aria-label="Progress">
      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>Progress</h1>
        <p style={{ color: 'var(--muted)' }}>
          Track your learning journey and metrics.
        </p>
      </header>

      {state.ui.error && (
        <div role="alert" className="card" style={{ padding: '.75rem', borderColor: 'var(--error)' }}>
          <strong style={{ color: 'var(--error)' }}>Error:</strong>{' '}
          <span>{String(state.ui.error)}</span>
        </div>
      )}

      {state.ui.loading ? (
        <LoadingSpinner label="Loading progress" />
      ) : (
        <>
          <div
            role="region"
            aria-label="Key stats"
            className="grid-autofit"
            style={{ marginBottom: '1rem' }}
          >
            <div className="card" style={{ padding: '1rem' }}>
              <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Total Skills</h2>
              <p style={{ fontSize: '2rem', margin: '.25rem 0' }}>{computed.totalSkills}</p>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Skills started</p>
            </div>
            <div className="card" style={{ padding: '1rem' }}>
              <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Completed Lessons</h2>
              <p style={{ fontSize: '2rem', margin: '.25rem 0' }}>{computed.completedLessons}</p>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Lifetime</p>
            </div>
            <div className="card" style={{ padding: '1rem' }}>
              <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Streak</h2>
              <p style={{ fontSize: '2rem', margin: '.25rem 0' }}>{computed.streak}🔥</p>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Days in a row (demo)</p>
            </div>
          </div>

          <div className="card" role="region" aria-label="Recent activity" style={{ padding: '1rem', minHeight: 120 }}>
            <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Recent Activity</h2>
            {entries.length === 0 ? (
              <p className="empty-state">No activity yet.</p>
            ) : (
              <ul style={{ marginTop: '.5rem' }}>
                {entries.slice(0, 10).map((e) => (
                  <li key={e.id} style={{ margin: '.25rem 0' }}>
                    {e.timestamp ? new Date(e.timestamp).toLocaleString() : '—'} — {e.lesson_id} — {e.completed ? 'Completed' : 'In progress'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
