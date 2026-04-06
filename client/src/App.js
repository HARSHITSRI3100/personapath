import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage  from './pages/LandingPage';
import LoginPage    from './pages/LoginPage';
import SignupPage   from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import QuizPage     from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import JournalPage  from './pages/JournalPage';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage  from './pages/HistoryPage';

// Layout
import AppLayout from './components/common/AppLayout';
import LoadingScreen from './components/common/LoadingScreen';

// Route guard: redirects to /login if not authenticated
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

// Route guard: redirects to /dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

    {/* Private – wrapped in sidebar layout */}
    <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
      <Route path="/dashboard"         element={<DashboardPage />} />
      <Route path="/quiz"              element={<QuizPage />} />
      <Route path="/quiz/result/:id"   element={<QuizResultPage />} />
      <Route path="/analysis"          element={<AnalysisPage />} />
      <Route path="/journal"           element={<JournalPage />} />
      <Route path="/history"           element={<HistoryPage />} />
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#27272a',
              color: '#f4f4f5',
              border: '1px solid #3f3f46',
              fontFamily: 'Sora, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#818cf8', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
