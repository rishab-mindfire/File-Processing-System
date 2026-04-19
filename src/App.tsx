import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import type { JSX } from 'react';
import Loader from './components/common/Loader';

// React.lazy component transform
const Login = lazy(() => import('./pages/login/LoginPage'));
const PageNotFound = lazy(() => import('./pages/errorPage/PageNotFound'));
const ProjectList = lazy(() => import('./pages/Projects/ProjectList'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails/ProjectDetails'));
const Layout = lazy(() => import('./components/layout/Layout'));

// Loading component
const PageLoader = () => <Loader />;

const RootRedirect = (): JSX.Element => {
  const { state } = useAuth();
  return <Navigate to={state.isAuthenticated ? '/projects' : '/login'} replace />;
};

function App() {
  return (
    <BrowserRouter basename="/">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectDetails />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
