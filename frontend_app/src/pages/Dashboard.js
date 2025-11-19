import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAppState } from '../state/store';

/**
 * PUBLIC_INTERFACE
 * Dashboard - Landing page showing quick actions and upcoming lessons.
 * Placeholder content is responsive and accessible, ready for API integration.
 *
 * Resume flow:
 * - GET /progress?user_id={id}&page_size=20 (or more)
 * - Pick the most recent entry with a lesson_id
 * - Navigate to /learn/:lessonId
 * - Gracefully handle missing items or 404 with an alert
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { state, actions, api } = useAppState();
  const [resumeBusy, setResumeBusy] = useState(false);
  const [resumeError, setResumeError] = useState('');

  const resume = useCallback(async () => {
    setResumeError('');
    setResumeBusy(true);
    actions.clearError();
    try {
      // Fetch recent progress entries via shared api client
      const res = await api.get(`/progress?user_id=${encodeURIComponent(state.currentUser.id)}&page_size=50`);
      // Accept multiple possible shapes: {items}, {entries}, array, or nested {progress: {entries}}
      const itemsRaw =
        (res?.data?.progress && Array.isArray(res.data.progress.entries) && res.data.progress.entries) ||
        (Array.isArray(res?.data?.items) && res.data.items) ||
        (Array.isArray(res?.data?.entries) && res.data.entries) ||
        (Array.isArray(res?.data) && res.data) ||
        [];
      const items = Array.isArray(itemsRaw) ? itemsRaw : [];

      if (items.length === 0) {
        setResumeError('No recent activity found to resume.');
        return;
      }

      // Sort by updated_at/created_at/timestamp descending
      const sorted = [...items].sort((a, b) => {
        const ta = new Date(a.updated_at || a.created_at || a.timestamp || 0).getTime();
        const tb = new Date(b.updated_at || b.created_at || b.timestamp || 0).getTime();
        return tb - ta;
      });

      // Pick the most recent entry that has a valid lesson_id
      const entry = sorted.find(e => e.lesson_id !== undefined && e.lesson_id !== null && String(e.lesson_id).trim() !== '');
      if (!entry) {
        setResumeError('Could not determine a lesson to resume.');
        return;
      }

      const lessonId = encodeURIComponent(String(entry.lesson_id));

      // Navigate to the interactive player route; it will handle content display and errors gracefully.
      navigate(`/learn/${lessonId}`, { state: { lessonTitle: entry.lesson_title || '' } });
    } catch (err) {
      setResumeError(err.message || 'Failed to resume last lesson.');
    } finally {
      setResumeBusy(false);
    }
  }, [navigate, state.currentUser.id, actions, api]);

  return (
    <section
      className="card"
      style={{ padding: '1rem' }}
      aria-label="Dashboard"
    >
      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', marginTop: '.25rem' }}>
          Welcome to SkillMaster. Choose a skill to begin learning.
        </p>
      </header>

      {resumeError && (
        <div role="alert" className="card" style={{ padding: '.75rem', borderColor: 'var(--error)', marginBottom: '.75rem' }}>
          <strong style={{ color: 'var(--error)' }}>Resume error:</strong> <span>{String(resumeError)}</span>
          <div style={{ marginTop: '.5rem', color: 'var(--muted)' }}>
            Ensure progress endpoints are reachable and data exists. See <a href="/__backend_help">Backend Help</a>.
          </div>
        </div>
      )}

      <div
        role="region"
        aria-label="Quick Actions"
        className="grid-autofit"
        style={{ marginBottom: '1rem' }}
      >
        <div className="card" style={{ padding: '1rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Continue Learning</h2>
          <p style={{ margin: '.5rem 0 1rem' }}>
            Resume your last lesson where you left off.
          </p>
          <button
            className="btn"
            type="button"
            aria-label="Resume last lesson"
            onClick={resume}
            disabled={resumeBusy}
          >
            {resumeBusy ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}><LoadingSpinner label="Resuming" /></span> : '▶️ Resume'}
          </button>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Explore Skills</h2>
          <p style={{ margin: '.5rem 0 1rem' }}>
            Browse catalog to discover new micro-skills.
          </p>
          <a className="btn" href="/skills" aria-label="Go to skills catalog">
            🧠 Browse Skills
          </a>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Your Progress</h2>
          <p style={{ margin: '.5rem 0 1rem' }}>
            Track your milestones and streaks.
          </p>
          <a className="btn" href="/progress" aria-label="Go to progress page">
            📈 View Progress
          </a>
        </div>
      </div>

      <div className="card" role="region" aria-label="Upcoming lessons" style={{ padding: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Upcoming</h2>
        <p className="empty-state" style={{ marginTop: '.5rem' }}>
          Your next lessons will appear here.
        </p>
      </div>
    </section>
  );
}
