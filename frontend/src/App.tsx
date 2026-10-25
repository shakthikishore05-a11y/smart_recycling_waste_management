import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import { Home } from './pages/Home';
import { HowItWorks } from './pages/HowItWorks';
import { RecyclingGuidePage } from './pages/RecyclingGuidePage';
import { AboutPage } from './pages/AboutPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Dashboard Pages
import { DashboardLayout } from './components/DashboardLayout';
import { Overview } from './pages/dashboard/Overview';
import { WasteScanner } from './pages/dashboard/WasteScanner';
import { WasteHistory } from './pages/dashboard/WasteHistory';
import { RecyclingActivities } from './pages/dashboard/RecyclingActivities';
import { FacilitiesPage } from './pages/dashboard/FacilitiesPage';
import { ChallengesPage } from './pages/dashboard/ChallengesPage';
import { AssistantChat } from './pages/dashboard/AssistantChat';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';

// Route guard for authenticated dashboard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7FAF7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-700" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/guide" element={<RecyclingGuidePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Authenticated Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="scanner" element={<WasteScanner />} />
            <Route path="history" element={<WasteHistory />} />
            <Route path="activities" element={<RecyclingActivities />} />
            <Route path="guide" element={<RecyclingGuidePage />} />
            <Route path="facilities" element={<FacilitiesPage />} />
            <Route path="challenges" element={<ChallengesPage />} />
            <Route path="assistant" element={<AssistantChat />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
