import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy-loaded page placeholders
const DashboardPage = lazy(() => Promise.resolve({
  default: function DashboardPage() {
    return (
      <section className="card" style={{ padding: '1rem' }} aria-label="Dashboard">
        <h1 style={{ marginTop: 0 }}>Dashboard</h1>
        <p>Welcome to SkillMaster. Choose a skill to begin learning.</p>
      </section>
    );
  }
}));

const SkillsPage = lazy(() => Promise.resolve({
  default: function SkillsPage() {
    return (
      <section className="card" style={{ padding: '1rem' }} aria-label="Skills">
        <h1 style={{ marginTop: 0 }}>Skills</h1>
        <p>Browse available micro-skills. (Placeholder)</p>
      </section>
    );
  }
}));

const SkillDetailPage = lazy(() => Promise.resolve({
  default: function SkillDetailPage() {
    return (
      <section className="card" style={{ padding: '1rem' }} aria-label="Skill Detail">
        <h1 style={{ marginTop: 0 }}>Skill Detail</h1>
        <p>Details for a specific skill. (Placeholder)</p>
      </section>
    );
  }
}));

const LearnLessonPage = lazy(() => Promise.resolve({
  default: function LearnLessonPage() {
    return (
      <section className="card" style={{ padding: '1rem' }} aria-label="Learn Lesson">
        <h1 style={{ marginTop: 0 }}>Lesson</h1>
        <p>Interactive learning content will appear here. (Placeholder)</p>
      </section>
    );
  }
}));

const ProgressPage = lazy(() => Promise.resolve({
  default: function ProgressPage() {
    return (
      <section className="card" style={{ padding: '1rem' }} aria-label="Progress">
        <h1 style={{ marginTop: 0 }}>Progress</h1>
        <p>Track your learning journey and metrics. (Placeholder)</p>
      </section>
    );
  }
}));

/**
 * PUBLIC_INTERFACE
 * AppRouter - Defines the core application routes.
 * Routes:
 *   /                   -> Dashboard
 *   /skills             -> Skills list
 *   /skills/:skillId    -> Skill detail
 *   /learn/:lessonId    -> Learning page
 *   /progress           -> Progress dashboard
 */
export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading page" />}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/skills/:skillId" element={<SkillDetailPage />} />
        <Route path="/learn/:lessonId" element={<LearnLessonPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
