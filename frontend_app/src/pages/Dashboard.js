import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Dashboard - Landing page showing quick actions and upcoming lessons.
 * Placeholder content is responsive and accessible, ready for API integration.
 */
export default function Dashboard() {
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

      <div
        role="region"
        aria-label="Quick Actions"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}
      >
        <div className="card" style={{ padding: '1rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Continue Learning</h2>
          <p style={{ margin: '.5rem 0 1rem' }}>
            Resume your last lesson where you left off.
          </p>
          <button className="btn" type="button" aria-label="Resume last lesson">
            ▶️ Resume
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
        <p style={{ marginTop: '.5rem', color: 'var(--muted)' }}>
          Your next lessons will appear here. (Placeholder)
        </p>
      </div>
    </section>
  );
}
