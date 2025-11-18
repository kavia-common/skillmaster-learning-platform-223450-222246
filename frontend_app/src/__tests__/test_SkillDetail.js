import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from '../state/store';
import * as apiClient from '../services/apiClient';
import SkillDetail from '../pages/SkillDetail';

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

describe('SkillDetail page', () => {
  beforeEach(() => {
    jest.spyOn(apiClient, 'apiGet').mockReset();
    jest.spyOn(apiClient, 'apiPost').mockReset();
    jest.spyOn(apiClient, 'default', 'get').mockReturnValue({
      get: apiClient.apiGet,
      post: apiClient.apiPost,
    });
  });

  function renderAt(skillId = 'skill-1') {
    return render(
      <AppStateProvider>
        <MemoryRouter initialEntries={[`/skills/${skillId}`]}>
          <Routes>
            <Route path="/skills/:skillId" element={<SkillDetail />} />
          </Routes>
        </MemoryRouter>
      </AppStateProvider>
    );
  }

  it('renders skill title and lessons', async () => {
    const detail = {
      id: 'skill-1',
      name: 'JavaScript Fundamentals',
      description: 'Core concepts',
      tags: ['js', 'web'],
      modules: [
        {
          id: 'm1',
          skill_id: 'skill-1',
          title: 'Basics',
          order: 1,
          lessons: [
            { id: 'l1', module_id: 'm1', title: 'Variables', content: '...', order: 1 },
            { id: 'l2', module_id: 'm1', title: 'Functions', content: '...', order: 2 },
          ],
        },
      ],
    };

    jest.spyOn(apiClient, 'apiGet').mockResolvedValueOnce({ status: 200, ok: true, data: detail });

    renderAt('skill-1');

    // Name in header
    expect(await screen.findByRole('heading', { name: detail.name })).toBeInTheDocument();

    // Lessons list
    const lessonsRegion = screen.getByRole('region', { name: /lessons/i });
    const list = within(lessonsRegion).getByRole('list');
    expect(within(list).getByRole('link', { name: /start variables/i })).toHaveAttribute(
      'href',
      `/learn/${encodeURIComponent('l1')}`
    );
    expect(within(list).getByRole('link', { name: /start functions/i })).toHaveAttribute(
      'href',
      `/learn/${encodeURIComponent('l2')}`
    );

    await waitFor(() => expect(apiClient.apiGet).toHaveBeenCalledWith('/skills/skill-1', expect.anything()));
  });
});
