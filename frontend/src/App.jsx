import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AppShellLayout } from './components/layout/AppShellLayout';
import { SignInPage } from './pages/SignInPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { ContactsPage } from './pages/ContactsPage';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><SignInPage /></PublicRoute>} />
      <Route
        element={
          <PrivateRoute>
            <AppShellLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/leads"      element={<LeadsPage />} />
        <Route path="/leads/:id"  element={<LeadDetailPage />} />
        <Route path="/contacts"   element={<ContactsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
