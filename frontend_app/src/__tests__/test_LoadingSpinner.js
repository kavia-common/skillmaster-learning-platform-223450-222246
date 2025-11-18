import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../components/common/LoadingSpinner';

describe('LoadingSpinner accessibility', () => {
  it('has role=status and aria-live polite and aria-busy true', () => {
    render(<LoadingSpinner label="Fetching data" />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveTextContent(/fetching data/i);
  });

  it('defaults to label "Loading"', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
  });
});
