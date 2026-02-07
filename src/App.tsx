import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { UserMenu } from './pages/UserMenu';
import { CartPage } from './pages/CartPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-offWhite">
        <p className="text-brand-maroon font-semibold">Checking admin access...</p>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

function AppContent() {
  const { toastVisible, toastMessage, toastProductName, hideToast } = useApp();
  
  return (
    <div className="min-h-screen bg-brand-offWhite font-sans text-gray-900">
      <Navbar />
      <Toast 
        message={toastMessage}
        productName={toastProductName}
        isVisible={toastVisible}
        onClose={hideToast}
      />
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<UserMenu />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
