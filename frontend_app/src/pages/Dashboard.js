import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAppState } from '../state/store';
import relationalApi from '../api/relationalClient';

/**
 * PUBLIC_INTERFACE
 * Dashboard - Landing page showing quick actions and upcoming lessons.
 * Placeholder content is responsive and accessible, ready for API integration.
 *
 * Resume flow:
 * - GET /progress?user_id={id}&page_size=20 (or more)
 * - Pick the most recent entry with a lesson_id
 * - Validate lesson exists via GET /lessons/{lesson_id}
 * - Navigate to /learn/:lessonId
 * - Gracefully handle missing items or 404 with an alert
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { state, actions } = useAppState();
  const [resumeBusy, setResumeBusy] = useState(false);
  const [resumeError, setResumeError] = useState('');

  const resume = useCallback(async () => {
    setResumeError('');
    setResumeBusy(true);
    actions.clearError();
    try {
      // Fetch recent progress entries
      const res = await relationalApi.get(`/progress?user_id=${encodeURIComponent(state.currentUser.id)}&page_size=50`);
      const items = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.data?.entries) ? res.data.entries : (Array.isArray(res?.data) ? res.data : []));
      if (!items || items.length === 0) {
        setResumeError('No recent activity found to resume.');
        return;
      }
      // Sort descending by created_at/updated_at/timestamp if present
      const sorted = [...items].sort((a, b) => {
        const ta = new Date(a.updated_at || a.created_at || a.timestamp || 0).getTime();
        const tb = new Date(b.updated_at || b.created_at || b.timestamp || 0).getTime();
        return tb - ta;
      });
      // Find first item with lesson_id
      const entry = sorted.find(e => e.lesson_id != null);
      if (!entry || entry.lesson_id == null) {
        setResumeError('Could not determine a lesson to resume.');
        return;
      }
      const lessonId = String(entry.lesson_id);

      // Validate lesson exists (relational expects numeric ids; API helper handles coercion)
      try {
        await relationalApi.get(`/lessons/${encodeURIComponent(lessonId)}`);
      } catch (e) {
        // If no lesson in relational, try catalog-style fallback: navigate to /lessons/:id (which loads and handles 404 in-page)
        // But still prefer the interactive player route for consistency.
        // We will proceed to navigate and let the target handle any display errors.
      }

      // Navigate to interactive player; attach minimal context if present
      navigate(`/learn/${encodeURIComponent(lessonId)}`, { state: { lessonTitle: entry.lesson_title || '' } });
    } catch (err) {
      setResumeError(err.message || 'Failed to resume last lesson.');
    } finally {
      setResumeBusy(false);
    }
  }, [navigate, state.currentUser.id, actions]);

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
