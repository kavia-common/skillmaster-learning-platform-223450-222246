import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Existing pages (kept for backward compatibility/tests)
import Dashboard from '../pages/Dashboard';
import SkillsCatalog from '../pages/SkillsCatalog';
import SkillDetail from '../pages/SkillDetail';
import LessonPlayer from '../pages/LessonPlayer';
import Progress from '../pages/Progress';

// New catalog routes per request
import SkillsList from '../pages/SkillsList';
import SkillDetailNew from '../pages/SkillDetailNew';
import LessonDetailNew from '../pages/LessonDetailNew';

/**
 * PUBLIC_INTERFACE
 * AppRouter - Defines the core application routes.
 * Routes:
 *   /                        -> Dashboard
 *   /skills                  -> Skills list (new), legacy component remains reachable
 *   /skills/:slug            -> Skill detail (new)
 *   /lessons/:id             -> Lesson detail (new)
 *   /learn/:lessonId         -> Legacy lesson player
 *   /progress                -> Progress dashboard
 */
export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading page" />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        {/* New Skills list that reads query params category/page */}
        <Route path="/skills" element={<SkillsList />} />

        {/* Keep legacy for tests linking by internal ID */}
        <Route path="/skills/:skillId" element={<SkillDetail />} />

        {/* New slug-based detail (also matches :skillId but provides new UX) */}
        <Route path="/skills/:slug" element={<SkillDetailNew />} />

        {/* New lesson detail route as requested */}
        <Route path="/lessons/:id" element={<LessonDetailNew />} />

        {/* Existing lesson player route preserved */}
        <Route path="/learn/:lessonId" element={<LessonPlayer />} />

        <Route path="/progress" element={<Progress />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
