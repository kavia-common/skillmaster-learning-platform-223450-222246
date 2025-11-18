import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from '../state/store';
import * as apiClient from '../services/apiClient';
import LessonPlayer from '../pages/LessonPlayer';

jest.useFakeTimers();

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

describe('LessonPlayer page', () => {
  beforeEach(() => {
    jest.spyOn(apiClient, 'apiGet').mockReset();
    jest.spyOn(apiClient, 'apiPost').mockReset();
    jest.spyOn(apiClient, 'default', 'get').mockReturnValue({
      get: apiClient.apiGet,
      post: apiClient.apiPost,
    });
  });

  function renderAt(lessonId = 'lesson-123') {
    return render(
      <AppStateProvider>
        <MemoryRouter initialEntries={[`/learn/${lessonId}`]}>
          <Routes>
            <Route path="/learn/:lessonId" element={<LessonPlayer />} />
          </Routes>
        </MemoryRouter>
      </AppStateProvider>
    );
  }

  it('loads prior attempts and then allows marking complete (POST)', async () => {
    const existing = [
      { id: 'e1', user_id: 'demo-user', lesson_id: 'lesson-123', skill_id: 's1', module_id: 'm1', completed: false, timestamp: new Date().toISOString() },
    ];

    // First call: GET progress for lesson
    jest.spyOn(apiClient, 'apiGet').mockResolvedValueOnce({ status: 200, ok: true, data: existing });

    // POST response: new entry
    const newEntry = {
      id: 'e2',
      user_id: 'demo-user',
      lesson_id: 'lesson-123',
      skill_id: 'unknown-skill',
      module_id: 'unknown-module',
      completed: true,
      timestamp: new Date().toISOString(),
    };
    jest.spyOn(apiClient, 'apiPost').mockResolvedValueOnce({ status: 200, ok: true, data: { entry: newEntry } });

    renderAt('lesson-123');

    // Loading visible initially
    expect(screen.getByRole('status')).toBeInTheDocument();

    // After load, interactive content placeholder shows
    expect(await screen.findByText(/interactive content will appear here/i)).toBeInTheDocument();

    // Click Complete
    fireEvent.click(screen.getByRole('button', { name: /mark complete/i }));

    // Assert POST called with expected path and partial body (unknown skill/module by default here)
    await waitFor(() => {
      expect(apiClient.apiPost).toHaveBeenCalledWith(
        '/progress/complete',
        expect.objectContaining({
          user_id: 'demo-user',
          lesson_id: 'lesson-123',
          skill_id: expect.any(String),
          module_id: expect.any(String),
        }),
        expect.anything()
      );
    });

    // Saved! message appears and then is cleared by timer
    expect(await screen.findByText(/saved!/i)).toBeInTheDocument();
    // advance timers to clear
    jest.runOnlyPendingTimers();

    // Attempts section should reflect two entries now
    expect(screen.getByRole('region', { name: /previous attempts/i })).toBeInTheDocument();
  });

  it('shows error alert if GET fails but still renders page', async () => {
    jest.spyOn(apiClient, 'apiGet').mockRejectedValueOnce(new Error('boom'));
    renderAt();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/error/i);
    expect(alert).toHaveTextContent(/boom/i);

    // Content still shows after error
    expect(await screen.findByText(/interactive content will appear here/i)).toBeInTheDocument();
  });
});
