import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Import page components
import Dashboard from '../pages/Dashboard';
import SkillsCatalog from '../pages/SkillsCatalog';
import SkillDetail from '../pages/SkillDetail';
import LessonPlayer from '../pages/LessonPlayer';
import Progress from '../pages/Progress';

// DailyByte extension imports
import LoginForm from '../pages/Auth/LoginForm';
import RegisterForm from '../pages/Auth/RegisterForm';
import TodayLesson from '../pages/TodayLesson';
import Streak from '../pages/Streak';
import AdminLessonUpload from '../pages/AdminLessonUpload';
import ProtectedRoute from './ProtectedRoute';

/**
 * PUBLIC_INTERFACE
 * AppRouter - Defines the core application routes.
 * Extended for DailyByte minimal LMS:
 *   /register  - Register a new user
 *   /login     - Login (save JWT)
 *   /today     - Fetch today's lesson (protected)
 *   /streak    - Show streak (protected)
 *   /admin     - Admin lesson upload (protected, no role check)
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

        {/* DailyByte-specific routes */}
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/today" element={
          <ProtectedRoute>
            <TodayLesson />
          </ProtectedRoute>
        } />
        <Route path="/streak" element={
          <ProtectedRoute>
            <Streak />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLessonUpload />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
