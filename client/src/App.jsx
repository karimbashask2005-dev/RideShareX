import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Home from './pages/Home';
import SearchRides from './pages/SearchRides';
import RideDetails from './pages/RideDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import DriverDashboard from './pages/DriverDashboard';
import WalletPage from './pages/WalletPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';
import NotFound from './pages/NotFound';
import VerificationCenter from './pages/VerificationCenter';

// Protected route wrapper
import ProtectedRoute from './components/common/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchRides />} />
              <Route path="/ride/:id" element={<RideDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/404" element={<NotFound />} />
            </Route>

            {/* Passenger / Common Dashboard Layout */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<MyBookings />} />
              <Route path="/bookings" element={<MyBookings />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/subscription" element={<WalletPage />} />
              <Route path="/verification-center" element={<VerificationCenter />} />
              <Route path="/publish" element={<DriverDashboard />} />
            </Route>

            {/* Driver Dashboard Layout */}
            <Route element={<ProtectedRoute allowedRoles={['driver', 'admin']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="/driver" element={<DriverDashboard />} />
              <Route path="/driver/rides" element={<DriverDashboard />} />
              <Route path="/driver/requests" element={<DriverDashboard />} />
            </Route>

            {/* Admin Dashboard Layout */}
            <Route element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
              <Route path="/admin/rides" element={<AdminDashboard />} />
              <Route path="/admin/revenue" element={<AdminDashboard />} />
              <Route path="/admin/settings" element={<AdminDashboard />} />
              <Route path="/admin/ads" element={<AdminDashboard />} />
            </Route>

            {/* Fallbacks */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
