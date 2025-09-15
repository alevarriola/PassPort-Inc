import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';


export default function App() {
  return (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
          <ProtectedRoute>
          <Profile />
          </ProtectedRoute>
          }
          />
        <Route
        path="/admin"
        element={
        <ProtectedRoute role="ADMIN">
          <Admin />
        </ProtectedRoute>
        }
        />
        <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
  );
}