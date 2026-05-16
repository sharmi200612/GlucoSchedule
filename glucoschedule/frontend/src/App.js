"import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import DashboardPage      from './pages/DashboardPage';
import GlucosePage        from './pages/GlucosePage';
import MedicationPage     from './pages/MedicationPage';
import MealsPage          from './pages/MealsPage';
import ExercisePage       from './pages/ExercisePage';
import MeditationPage     from './pages/MeditationPage';
import AppointmentsPage   from './pages/AppointmentsPage';
import PlannerPage        from './pages/PlannerPage';
import ReportsPage        from './pages/ReportsPage';
import ProfilePage        from './pages/ProfilePage';
import AIAnalysisPage     from './pages/AIAnalysisPage';
import NotificationsPage  from './pages/NotificationsPage';

import Sidebar from './components/common/Sidebar';
import Footer  from './components/common/Footer';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main className="main-content" style={{ flex: 1, marginLeft: 0 }}>{children}</main>
      <Footer />
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/"               element={<PrivateRoute><AppLayout><DashboardPage /></AppLayout></PrivateRoute>} />
      <Route path="/glucose"        element={<PrivateRoute><AppLayout><GlucosePage /></AppLayout></PrivateRoute>} />
      <Route path="/medication"     element={<PrivateRoute><AppLayout><MedicationPage /></AppLayout></PrivateRoute>} />
      <Route path="/meals"          element={<PrivateRoute><AppLayout><MealsPage /></AppLayout></PrivateRoute>} />
      <Route path="/exercise"       element={<PrivateRoute><AppLayout><ExercisePage /></AppLayout></PrivateRoute>} />
      <Route path="/meditation"     element={<PrivateRoute><AppLayout><MeditationPage /></AppLayout></PrivateRoute>} />
      <Route path="/appointments"   element={<PrivateRoute><AppLayout><AppointmentsPage /></AppLayout></PrivateRoute>} />
      <Route path="/planner"        element={<PrivateRoute><AppLayout><PlannerPage /></AppLayout></PrivateRoute>} />
      <Route path="/reports"        element={<PrivateRoute><AppLayout><ReportsPage /></AppLayout></PrivateRoute>} />
      <Route path="/profile"        element={<PrivateRoute><AppLayout><ProfilePage /></AppLayout></PrivateRoute>} />
      <Route path="/ai-analysis"    element={<PrivateRoute><AppLayout><AIAnalysisPage /></AppLayout></PrivateRoute>} />
      <Route path="/notifications"  element={<PrivateRoute><AppLayout><NotificationsPage /></AppLayout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
