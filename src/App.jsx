import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import KDSPage from './pages/KDSPage';
import WaiterPage from './pages/WaiterPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import DynamicBackground from './components/layout/DynamicBackground';

function DemoEntry() {
  const { login } = useRestaurant();
  const navigate = useNavigate();

  useEffect(() => {
    login('admin');
    navigate('/admin', { replace: true });
  }, [login, navigate]);

  return <div className="p-8 text-slate-700 font-semibold">Loading demo...</div>;
}

function App() {
  return (
    <RestaurantProvider>
      <DynamicBackground />
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo" element={<DemoEntry />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Internal Dashboard Routes */}
          <Route element={<Layout />}>
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />
            <Route path="/kds" element={<ProtectedRoute allowedRoles={['admin', 'kitchen']}><KDSPage /></ProtectedRoute>} />
            <Route path="/waiter" element={<ProtectedRoute allowedRoles={['admin', 'waiter']}><WaiterPage /></ProtectedRoute>} />
          </Route>
          
          {/* Catch-all route mapping to home or login might also be good, but we leave it default for now */}
        </Routes>
      </Router>
    </RestaurantProvider>
  );
}

export default App;
