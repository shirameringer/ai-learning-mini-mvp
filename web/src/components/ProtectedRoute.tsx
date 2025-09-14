// web/src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { getUser } from '../lib/auth';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const me = getUser();
  if (!me) return <Navigate to="/auth" replace />;
  return children;
}
