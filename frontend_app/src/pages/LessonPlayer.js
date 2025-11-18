import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * LessonPlayer - Hosts interactive lesson content with basic transport controls.
 * Uses route param `lessonId`.
 */
export default function LessonPlayer() {
  const { lessonId } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="card" style={{ padding: '1rem' }} aria-label="Lesson Player">
      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>Lesson</h1>
        <p style={{ color: 'var(--muted)' }}>
          Lesson ID: <strong>{lessonId}</strong> (Placeholder)
        </p>
      </header>

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
        <p style={{ margin: 0, color: 'var(--muted)' }}>
          Interactive content will appear here.
        </p>
      </div>

      <div role="group" aria-label="Lesson controls" style={{ display: 'flex', gap: '.5rem' }}>
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
      </div>
    </section>
  );
}
