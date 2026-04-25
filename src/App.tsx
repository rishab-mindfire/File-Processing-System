import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import type { JSX } from 'react';
import ProjectListSkeleton from './components/common/Suspense/ProjectListSkeleton';
import ProjectDetailsSkeleton from './components/common/Suspense/ProjectDetailsSkeleton';
import Signup from './pages/login/SignUp';

// React.lazy component
const Login = lazy(() => import('./pages/login/LoginPage'));
const PageNotFound = lazy(() => import('./pages/errorPage/PageNotFound'));
const ProjectList = lazy(() => import('./pages/Projects/ProjectList'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails/ProjectDetails'));
const Layout = lazy(() => import('./components/layout/Layout'));

const RootRedirect = (): JSX.Element => {
  const { state } = useAuth();
  return <Navigate to={state.isAuthenticated ? '/projects' : '/login'} replace />;
};

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<ProjectListSkeleton />}>
                  <ProjectList />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<ProjectDetailsSkeleton />}>
                  <ProjectDetails />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
