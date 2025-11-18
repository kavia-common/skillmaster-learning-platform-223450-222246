import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppStateProvider } from '../state/store';
import * as apiClient from '../services/apiClient';
import SkillsCatalog from '../pages/SkillsCatalog';

// Mock env config to avoid touching real window/location based values if imported somewhere
jest.mock('../config/env', () => ({
  __esModule: true,
  default: {
    apiBaseUrl: 'http://localhost:3001',
    frontendUrl: 'http://localhost:3000',
    wsUrl: '',
    nodeEnv: 'test',
    logLevel: 'error',
    featureFlags: {},
    healthcheckPath: '/healthz',
  },
}));

describe('SkillsCatalog page', () => {
  beforeEach(() => {
    jest.spyOn(apiClient, 'apiGet').mockReset();
    jest.spyOn(apiClient, 'apiPost').mockReset();
    // Provider uses default exported api via state/store. Ensure those calls hit our spies:
    jest.spyOn(apiClient, 'default', 'get').mockReturnValue({
      get: apiClient.apiGet,
      post: apiClient.apiPost,
    });
  });

  const renderPage = () =>
    render(
      <AppStateProvider>
        <MemoryRouter initialEntries={['/skills']}>
          <SkillsCatalog />
        </MemoryRouter>
      </AppStateProvider>
    );

  it('shows loading state initially', async () => {
    jest.spyOn(apiClient, 'apiGet').mockResolvedValueOnce({ status: 200, ok: true, data: [] });
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
    await waitFor(() => expect(apiClient.apiGet).toHaveBeenCalledWith('/skills', expect.any(Object) || {}));
  });

  it('renders error state if API fails', async () => {
    jest.spyOn(apiClient, 'apiGet').mockRejectedValueOnce(new Error('Network down'));
    renderPage();

    // Expect an alert after fetch failure
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/error/i);
    expect(alert).toHaveTextContent(/network down/i);
  });

  it('renders a list of skills on success', async () => {
    const skills = [
      { id: 's1', name: 'React Basics', description: 'Intro to React' },
      { id: 's2', name: 'Testing', description: 'Learn RTL' },
    ];
    jest.spyOn(apiClient, 'apiGet').mockResolvedValueOnce({ status: 200, ok: true, data: skills });

    renderPage();

    // Wait for items to appear and ensure loading goes away
    expect(await screen.findByRole('list', { name: /skill list/i })).toBeInTheDocument();
    for (const s of skills) {
      expect(screen.getByRole('heading', { name: s.name })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: new RegExp(`details for ${s.name}`, 'i') })).toHaveAttribute(
        'href',
        `/skills/${encodeURIComponent(s.id)}`
      );
    }
  });
});
