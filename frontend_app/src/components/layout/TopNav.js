import React from 'react';

/**
 * PUBLIC_INTERFACE
 * TopNav - Application top bar with title and placeholders for controls.
 */
export default function TopNav() {
  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'linear-gradient(180deg, var(--surface), rgba(255,255,255,0.85))',
        backdropFilter: 'saturate(180%) blur(6px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '.75rem 1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div
            aria-hidden="true"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(17,24,39,0.02))',
              border: '1px solid var(--border)'
            }}
          />
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>
            SkillMaster
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <button
            className="btn btn-secondary"
            type="button"
            aria-label="Toggle theme"
            title="Theme (coming soon)"
            style={{
              borderColor: 'var(--border)',
            }}
            onClick={() => {
              // Placeholder: Implement theme switching by toggling data-theme
              // e.g., document.documentElement.dataset.theme = 'dark'
            }}
          >
            🌗
            <span className="visually-hidden">Toggle theme</span>
          </button>
        </div>
      </div>
    </header>
  );
}
