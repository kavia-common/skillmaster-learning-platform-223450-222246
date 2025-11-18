import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AppRouter from '../routes/Router';

// Render helper to assert a route renders expected heading/title present in each page.
function renderAt(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/*" element={<AppRouter />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AppRouter routes', () => {
  it("renders Dashboard for '/'", () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it("renders SkillsCatalog for '/skills'", () => {
    renderAt('/skills');
    expect(screen.getByRole('heading', { name: /skills/i })).toBeInTheDocument();
  });

  it("renders SkillDetail for '/skills/:skillId'", () => {
    renderAt('/skills/skill-123');
    // SkillDetail header shows Skill Detail or resolved name; both acceptable
    expect(
      screen.getByRole('heading', { name: /skill detail|skill/i })
    ).toBeInTheDocument();
  });

  it("renders LessonPlayer for '/learn/:lessonId'", () => {
    renderAt('/learn/lesson-42');
    expect(screen.getByRole('heading', { name: /lesson/i })).toBeInTheDocument();
    expect(screen.getByText(/lesson id:/i)).toBeInTheDocument();
  });

  it("renders Progress for '/progress'", () => {
    renderAt('/progress');
    expect(screen.getByRole('heading', { name: /progress/i })).toBeInTheDocument();
  });

  it("unknown paths redirect to '/' (Dashboard)", () => {
    renderAt('/unknown/path');
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });
});
