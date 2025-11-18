import React from 'react';

/**
 * PUBLIC_INTERFACE
 * LoadingSpinner - A simple, accessible progress indicator.
 *
 * @param {object} props
 * @param {string} [props.label] - Accessible label for screen readers.
 */
export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '.75rem',
        padding: '.75rem 1rem',
        background: 'var(--surface)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        color: 'var(--text)'
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: '3px solid rgba(37,99,235,0.2)',
          borderTopColor: 'var(--primary)',
          animation: 'sm-spin 1s linear infinite'
        }}
      />
      <span>{label}...</span>
      <style>
        {`@keyframes sm-spin { 
            to { transform: rotate(360deg); } 
          }`}
      </style>
    </div>
  );
}
