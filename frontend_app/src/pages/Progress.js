import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Progress - Displays user progress metrics, streaks, and achievements.
 * Placeholder layout structured for future charts/graphs integration.
 */
export default function Progress() {
  return (
    <section className="card" style={{ padding: '1rem' }} aria-label="Progress">
      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>Progress</h1>
        <p style={{ color: 'var(--muted)' }}>
          Track your learning journey and metrics. (Placeholder)
        </p>
      </header>

      <div
        role="region"
        aria-label="Key stats"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}
      >
        <div className="card" style={{ padding: '1rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Total Skills</h2>
          <p style={{ fontSize: '2rem', margin: '.25rem 0' }}>12</p>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Skills started</p>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Completed Lessons</h2>
          <p style={{ fontSize: '2rem', margin: '.25rem 0' }}>34</p>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Lifetime</p>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Streak</h2>
          <p style={{ fontSize: '2rem', margin: '.25rem 0' }}>5🔥</p>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Days in a row</p>
        </div>
      </div>

      <div className="card" role="region" aria-label="Progress chart placeholder" style={{ padding: '1rem', minHeight: 180 }}>
        <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Progress Over Time</h2>
        <p style={{ color: 'var(--muted)' }}>
          A chart will be displayed here. (Placeholder)
        </p>
      </div>
    </section>
  );
}
