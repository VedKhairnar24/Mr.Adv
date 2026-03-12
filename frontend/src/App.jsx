import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Cases from './pages/Cases';
import Documents from './pages/Documents';
import CaseDetail from './pages/CaseDetail';
import ClientDetail from './pages/ClientDetail';
import Landing from './pages/Landing';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes - With Sidebar Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/clients" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Clients />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/clients/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ClientDetail />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/cases" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Cases />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/documents" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Documents />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/cases/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <CaseDetail />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
