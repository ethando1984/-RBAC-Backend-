import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Roles from './pages/Roles';
import Policies from './pages/Policies';
import Layout from './components/Layout';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

import RoleDetail from './pages/RoleDetail';

import PermissionDetail from './pages/PermissionDetail';
import { RouteGuard } from './components/RouteGuard';

const queryClient = new QueryClient();
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    background: { default: '#0d1117', paper: '#161b22' }
  },
  typography: { fontFamily: 'Inter, system-ui, sans-serif' }
});

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" />;
  return <Layout><Outlet /></Layout>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />

                {/* IAM Management Routes - protected by system:WRITE mapping */}
                <Route element={<RouteGuard namespace="system" action="WRITE" />}>
                  <Route path="/users" element={<Users />} />
                  <Route path="/users/:id" element={<UserDetail />} />
                  <Route path="/roles" element={<Roles />} />
                  <Route path="/roles/:id" element={<RoleDetail />} />
                  <Route path="/policies" element={<Policies />} />
                  <Route path="/policies/:id" element={<PermissionDetail />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
