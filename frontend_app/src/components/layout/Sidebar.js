import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Sidebar - Left-side navigation for primary sections.
 * Accessibility: role="navigation", aria-label for clarity.
 */
export default function Sidebar() {
  return (
    <aside
      className="sidebar"
      role="navigation"
      aria-label="Primary"
      style={{
        width: '240px',
        minWidth: '220px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        gap: '0.5rem',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <div
          className="brand"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.6rem',
            fontWeight: 700,
            color: 'var(--text)'
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: 'linear-gradient(135deg, var(--primary), rgba(37,99,235,0.2))',
              boxShadow: '0 0 0 4px rgba(37,99,235,0.12)'
            }}
          />
          SkillMaster
        </div>
        <p style={{ margin: '.5rem 0 0', color: 'var(--muted)' }}>
          Learn micro-skills efficiently
        </p>
      </div>

      <nav aria-label="Primary navigation">
        <ul>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              style={linkStyle}
            >
              <span aria-hidden="true">🏠</span>
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/skills"
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              style={linkStyle}
            >
              <span aria-hidden="true">🧠</span>
              <span>Skills</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/progress"
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              style={linkStyle}
            >
              <span aria-hidden="true">📈</span>
              <span>Progress</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div style={{ marginTop: 'auto', color: 'var(--muted)', fontSize: '.85rem' }}>
        <div className="card" style={{ padding: '.75rem' }}>
          <strong style={{ color: 'var(--text)' }}>Tip</strong>
          <p style={{ margin: '.4rem 0 0' }}>
            Explore Skills to start a lesson.
          </p>
        </div>
      </div>
    </aside>
  );
}

const linkStyle = ({}) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '.6rem',
  padding: '.6rem .75rem',
  borderRadius: '10px',
  color: 'var(--text)',
  transition: 'background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast)',
  border: '1px solid transparent'
});

// Add small CSS tweak via style tag to reflect active state using CSS variables
