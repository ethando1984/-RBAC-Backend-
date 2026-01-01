import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { PageShell } from './components/layout/PageShell';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users.tsx';
import UserDetail from './pages/UserDetail';
import Roles from './pages/Roles';
import Policies from './pages/Policies';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import PermissionMatrix from './pages/PermissionMatrix';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const ProtectedRoute = ({ children, permission }: { children?: React.ReactNode, permission?: { namespace: string, action: string } }) => {
  const { user, isLoading, can, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permission) {
    const isSuperAdmin = hasRole('Super Administrator');
    if (!isSuperAdmin && !can(permission.namespace, permission.action)) {
      return <Navigate to="/" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute><PageShell><Outlet /></PageShell></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />

              <Route element={<ProtectedRoute permission={{ namespace: 'users', action: 'READ' }} />}>
                <Route path="/users" element={<Users />} />
                <Route path="/users/:id" element={<UserDetail />} />
              </Route>

              <Route element={<ProtectedRoute permission={{ namespace: 'roles', action: 'READ' }} />}>
                <Route path="/roles" element={<Roles />} />
              </Route>

              <Route element={<ProtectedRoute permission={{ namespace: 'policies', action: 'READ' }} />}>
                <Route path="/policies" element={<Policies />} />
                <Route path="/matrix" element={<PermissionMatrix />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
              </Route>

              <Route element={<ProtectedRoute permission={{ namespace: 'orders', action: 'READ' }} />}>
                <Route path="/orders" element={<Orders />} />
              </Route>

              <Route element={<ProtectedRoute permission={{ namespace: 'inventory', action: 'READ' }} />}>
                <Route path="/inventory" element={<Inventory />} />
              </Route>

              {/* Settings - accessible to all authenticated users */}
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
