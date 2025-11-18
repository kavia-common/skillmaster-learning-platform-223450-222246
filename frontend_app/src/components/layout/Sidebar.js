import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Sidebar - Left-side navigation for primary sections.
 * Accessibility: role="navigation", aria-label for clarity.
 * Includes a responsive collapse on small screens and keyboard accessible toggle.
 */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // Collapse automatically on small screens
  useEffect(() => {
    const handler = () => {
      setCollapsed(window.innerWidth < 960);
    };
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const sidebarStyle = useMemo(() => ({
    width: collapsed ? '72px' : '240px',
    minWidth: collapsed ? '64px' : '220px',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    gap: '0.5rem',
    position: 'sticky',
    top: 0,
    height: '100vh',
    transition: 'width var(--transition-normal), min-width var(--transition-normal), padding var(--transition-fast)',
  }), [collapsed]);

  const linkClass = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '');

  return (
    <aside
      className="sidebar"
      role="navigation"
      aria-label="Primary"
      style={sidebarStyle}
    >
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: '.5rem' }}>
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
          {!collapsed && <span>SkillMaster</span>}
        </div>

        {/* Collapse toggle (visible when space allows) */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setCollapsed(v => !v)}
          aria-pressed={collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
          style={{ padding: '.4rem .6rem' }}
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      {!collapsed && (
        <p style={{ margin: '.25rem 0 .5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Learn micro-skills efficiently
        </p>
      )}

      <nav aria-label="Primary navigation">
        <ul>
          <li>
            <NavLink
              to="/"
              end
              className={linkClass}
              style={linkStyle(collapsed)}
            >
              <span aria-hidden="true">🏠</span>
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/skills"
              className={linkClass}
              style={linkStyle(collapsed)}
            >
              <span aria-hidden="true">🧠</span>
              {!collapsed && <span>Skills</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/progress"
              className={linkClass}
              style={linkStyle(collapsed)}
            >
              <span aria-hidden="true">📈</span>
              {!collapsed && <span>Progress</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div style={{ marginTop: 'auto', color: 'var(--muted)', fontSize: '.85rem' }}>
        <div className="card" style={{ padding: '.75rem', textAlign: collapsed ? 'center' : 'left' }}>
          <strong style={{ color: 'var(--text)' }}>{collapsed ? 'Tip' : 'Tip'}</strong>
          {!collapsed && (
            <p style={{ margin: '.4rem 0 0' }}>
              Explore Skills to start a lesson.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

const linkStyle = (collapsed) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: collapsed ? 'center' : 'flex-start',
  gap: collapsed ? 0 : '.6rem',
  padding: '.6rem .75rem',
  borderRadius: '10px',
  color: 'var(--text)',
  transition: 'background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast)',
  border: '1px solid transparent'
});
