import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Componente para rutas protegidas
export default function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();

    // Mientras carga, muestra un mensaje
    if (loading) return <div style={{ padding: 24 }}>Cargando...</div>;

    // Si no hay usuario, redirige al login
    if (!user) return <Navigate to="/login" replace />;

    // Si se requiere un rol específico y el usuario no lo tiene, redirige al perfil
    if (role && user.role !== role) return <Navigate to="/profile" replace />;


    return children;
}