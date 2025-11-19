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

// New relational pages
import SubjectsList from '../pages/SubjectsList';
import ModulesList from '../pages/ModulesList';
import LessonsList from '../pages/LessonsList';
import LessonDetailRelational from '../pages/LessonDetailRelational';
import BackendHelp from '../pages/BackendHelp';

/**
 * PUBLIC_INTERFACE
 * AppRouter - Defines the core application routes.
 * Routes:
 *   /                        -> Dashboard
 *   /skills                  -> Skills list (new), legacy component remains reachable
 *   /skills/:slug            -> Skill detail (new)
 *   /lessons/:id             -> Lesson detail (new) [catalog]
 *   /learn/:lessonId         -> Legacy lesson player
 *   /progress                -> Progress dashboard
 *   /subjects                -> Subjects list
 *   /subjects/:subjectId/modules -> Modules list for subject
 *   /modules/:moduleId/lessons -> Lessons list for module
 *   /lessons/:lessonId       -> Lesson detail with activities (relational) - note: shares path, keep both imports
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

        {/* New lesson detail route as requested (catalog variant) */}
        <Route path="/lessons/:id" element={<LessonDetailNew />} />

        {/* Relational navigation */}
        <Route path="/subjects" element={<SubjectsList />} />
        <Route path="/subjects/:subjectId/modules" element={<ModulesList />} />
        <Route path="/modules/:moduleId/lessons" element={<LessonsList />} />
        {/* Optionally expose an alternate detail path to avoid clash */}
        <Route path="/rel/lessons/:lessonId" element={<LessonDetailRelational />} />

        {/* Existing lesson player route preserved */}
        <Route path="/learn/:lessonId" element={<LessonPlayer />} />

        <Route path="/progress" element={<Progress />} />
        <Route path="/__backend_help" element={<BackendHelp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
