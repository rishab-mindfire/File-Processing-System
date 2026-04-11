import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/LoginPage';
import PageNotFound from './pages/errorPage/PageNotFound';
import ProtectedRoute from './auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import ProjectList from './pages/Projects/ProjectList';
import Layout from './components/layout/Layout';
import ProjectDetails from './pages/ProjectDetails/ProjectDetails';

const RootRedirect = () => {
  const { state } = useAuth();

  return (
    <Navigate to={state.isAuthenticated ? '/projects' : '/login'} replace />
  );
};

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
