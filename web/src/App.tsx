// web/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/Auth';
import Dashboard from './pages/Dashboard';
import LessonView from './pages/LessonView';
import { isAuthed } from './lib/auth';

// Redirect "/" (and not-found) based on auth status
function RootRedirect() {
  return isAuthed() ? <Navigate to="/app" replace /> : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lesson/:id"
          element={
            <ProtectedRoute>
              <LessonView />
            </ProtectedRoute>
          }
        />

        {/* keep wildcard LAST so it won't shadow other routes */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
