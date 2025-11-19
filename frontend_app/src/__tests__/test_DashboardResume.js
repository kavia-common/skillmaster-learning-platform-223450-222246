import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from '../state/store';
import * as apiClient from '../services/apiClient';
import Dashboard from '../pages/Dashboard';
import LessonPlayer from '../pages/LessonPlayer';

// Mock env config for api base
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

describe('Dashboard resume flow', () => {
  beforeEach(() => {
    jest.spyOn(apiClient, 'apiGet').mockReset();
    jest.spyOn(apiClient, 'apiPost').mockReset();
    jest.spyOn(apiClient, 'default', 'get').mockReturnValue({
      get: apiClient.apiGet,
      post: apiClient.apiPost,
    });
  });

  function renderApp(initial = ['/']) {
    return render(
      <AppStateProvider>
        <MemoryRouter initialEntries={initial}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/learn/:lessonId" element={<LessonPlayer />} />
          </Routes>
        </MemoryRouter>
      </AppStateProvider>
    );
  }

  it('navigates to /learn/:lessonId using most recent progress entry', async () => {
    const progress = {
      items: [
        { id: 2, user_id: 'demo-user', lesson_id: 456, completed: false, updated_at: new Date(Date.now() - 1000).toISOString() },
        { id: 3, user_id: 'demo-user', lesson_id: 789, completed: true, updated_at: new Date().toISOString() },
      ],
      total: 2,
    };
    // GET /progress?user_id=... returns items
    jest.spyOn(apiClient, 'apiGet').mockImplementation((path) => {
      if (path.startsWith('/progress?')) {
        return Promise.resolve({ status: 200, ok: true, data: progress });
      }
      if (path.startsWith('/lessons/')) {
        // validation of lesson existence
        return Promise.resolve({ status: 200, ok: true, data: { id: 789, title: 'Any' } });
      }
      return Promise.resolve({ status: 200, ok: true, data: [] });
    });

    renderApp();

    fireEvent.click(screen.getByRole('button', { name: /resume last lesson/i }));

    // After resume, expect to be on the player page with the lesson id shown
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /lesson/i })).toBeInTheDocument();
      expect(screen.getByText(/lesson id:/i)).toBeInTheDocument();
    });
  });

  it('shows graceful error if no recent activity', async () => {
    jest.spyOn(apiClient, 'apiGet').mockImplementation((path) => {
      if (path.startsWith('/progress?')) {
        return Promise.resolve({ status: 200, ok: true, data: { items: [], total: 0 } });
      }
      return Promise.resolve({ status: 200, ok: true, data: [] });
    });

    renderApp();

    fireEvent.click(screen.getByRole('button', { name: /resume last lesson/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/no recent activity/i);
  });
});
