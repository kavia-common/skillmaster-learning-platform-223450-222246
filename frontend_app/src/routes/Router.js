import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Import page components
import Dashboard from '../pages/Dashboard';
import SkillsCatalog from '../pages/SkillsCatalog';
import SkillDetail from '../pages/SkillDetail';
import LessonPlayer from '../pages/LessonPlayer';
import Progress from '../pages/Progress';

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
        <Route path="/" element={<Dashboard />} />
        <Route path="/skills" element={<SkillsCatalog />} />
        <Route path="/skills/:skillId" element={<SkillDetail />} />
        <Route path="/learn/:lessonId" element={<LessonPlayer />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
