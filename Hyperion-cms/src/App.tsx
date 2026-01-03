import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Dashboard } from './pages/Dashboard';
import { ArticleList } from './pages/Articles/ArticleList';
import { ArticleEditor } from './pages/Articles/ArticleEditor';
import { Workflow } from './pages/Workflow';
import { MediaLibrary } from './pages/Media/MediaLibrary';
import { Categories } from './pages/Taxonomy/Categories';
import { Authors } from './pages/Taxonomy/Authors';
import { Storylines } from './pages/Taxonomy/Storylines';
import { StorylineEditor } from './pages/Taxonomy/StorylineEditor';
import { Tags } from './pages/Taxonomy/Tags';
import { Crawler } from './pages/Tools/Crawler';
import { Tasks } from './pages/Tools/Tasks';
import { SEO } from './pages/Tools/SEO';
import { AuditLogs } from './pages/System/AuditLogs';
import { Settings } from './pages/System/Settings';
import { Layouts } from './pages/Design/Layouts';
import { Login } from './pages/Login';
import RoyaltyDashboard from './royalties/pages/RoyaltyDashboard';
import RoyaltyRecordList from './royalties/pages/RoyaltyRecordList';
import RoyaltyRecordDetail from './royalties/pages/RoyaltyRecordDetail';
import RoyaltyRules from './royalties/pages/RoyaltyRules';
import RoyaltyBatches from './royalties/pages/RoyaltyBatches';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="pt-16 flex-1 bg-gray-50">
          <div className="mx-auto max-w-7xl p-6 md:p-8 animate-fade-in space-y-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/articles" element={<ArticleList />} />
              <Route path="/workflow" element={<Workflow />} />
              <Route path="/media" element={<MediaLibrary />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/authors" element={<Authors />} />
              <Route path="/storylines" element={<Storylines />} />
              <Route path="/taxonomy/storylines" element={<Storylines />} />
              <Route path="/taxonomy/storylines/:id" element={<StorylineEditor />} />
              <Route path="/tags" element={<Tags />} />
              <Route path="/crawler" element={<Crawler />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/seo" element={<SEO />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/layouts" element={<Layouts />} />

              {/* Royalty Module */}
              <Route path="/royalties" element={<RoyaltyDashboard />} />
              <Route path="/royalties/records" element={<RoyaltyRecordList />} />
              <Route path="/royalties/records/:id" element={<RoyaltyRecordDetail />} />
              <Route path="/royalties/rules" element={<RoyaltyRules />} />
              <Route path="/royalties/batches" element={<RoyaltyBatches />} />
              <Route path="*" element={<div className="p-10 text-center text-gray-500">Module coming soon...</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/articles/new" element={
            <ProtectedRoute>
              <ArticleEditor />
            </ProtectedRoute>
          } />
          <Route path="/articles/edit/:id" element={
            <ProtectedRoute>
              <ArticleEditor />
            </ProtectedRoute>
          } />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
