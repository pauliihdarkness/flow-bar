import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MenuPage from '../pages/menu/MenuPage';
import BarPage from '../pages/bar/BarPage';
import LoginPage from '../pages/admin/LoginPage';
import AdminPage from '../pages/admin/AdminPage';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminPersonal from '../pages/admin/AdminPersonal';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminHistory from '../pages/admin/AdminHistory';
import AdminShifts from '../pages/admin/AdminShifts';
import ProtectedRoute from '../components/layout/ProtectedRoute';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas Protegidas - Barman */}
        <Route 
          path="/bar" 
          element={
            <ProtectedRoute role="barman">
              <BarPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas Protegidas - Admin */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="personal" element={<AdminPersonal />} />
          <Route path="history" element={<AdminHistory />} />
          <Route path="shifts" element={<AdminShifts />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
