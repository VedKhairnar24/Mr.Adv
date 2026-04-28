import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Cases from './pages/Cases';
import Documents from './pages/Documents';
import CaseDetail from './pages/CaseDetail';
import ClientDetail from './pages/ClientDetail';
import Hearings from './pages/Hearings';
import HearingDetail from './pages/HearingDetail';
import Settings from './pages/Settings';
import Notes from './pages/Notes';
import NoteForm from './pages/NoteForm';
import NoteDetail from './pages/NoteDetail';
import Landing from './pages/Landing';
import CaseLookup from './pages/CaseLookup';
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
        <Route path="/cases/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <CaseDetail />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/case-lookup" element={
          <ProtectedRoute>
            <DashboardLayout>
              <CaseLookup />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hearings" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Hearings />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/hearings/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <HearingDetail />
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
        <Route path="/notes" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Notes />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/notes/create" element={
          <ProtectedRoute>
            <DashboardLayout>
              <NoteForm />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/notes/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <NoteDetail />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/notes/:id/edit" element={
          <ProtectedRoute>
            <DashboardLayout>
              <NoteForm />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
