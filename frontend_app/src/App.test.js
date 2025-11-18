import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders app shell with layout', () => {
  render(<BrowserRouter><App /></BrowserRouter>);
  const shell = screen.getByTestId('app-shell');
  expect(shell).toBeInTheDocument();
});
