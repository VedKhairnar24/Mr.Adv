import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Cases from './pages/Cases';
import Documents from './pages/Documents';
import CaseDetail from './pages/CaseDetail';
import ClientDetail from './pages/ClientDetail';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes - With Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/clients" element={
          <ProtectedRoute>
            <MainLayout>
              <Clients />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/clients/:id" element={
          <ProtectedRoute>
            <MainLayout>
              <ClientDetail />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/cases" element={
          <ProtectedRoute>
            <MainLayout>
              <Cases />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/documents" element={
          <ProtectedRoute>
            <MainLayout>
              <Documents />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/cases/:id" element={
          <ProtectedRoute>
            <MainLayout>
              <CaseDetail />
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
