import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Página de login
export default function Login() {
    
    // Hooks y estados
    const { login } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Maneja el submit del formulario
    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const u = await login(email, password);
            if (u.role === 'ADMIN') nav('/admin');
            else nav('/profile');
        } catch (e) {
            // Si el backend responde con bloqueo
            if (e?.response?.status === 429) {
                setError('Demasiados intentos fallidos. Tu sesión está bloqueada por 10 minutos.');
            } else {
                setError('Credenciales inválidas');
            }
        } finally {
            setLoading(false);
        }
    }

    // Render
    return (
        <div className="centered">
            <div className="card form-card stack-lg">
            <div>
                <h1 className="heading-xl">Iniciar sesión</h1>
                <p className="muted">Accedé al panel con tu email y contraseña</p>
            </div>
            <form className="stack" onSubmit={onSubmit}>
                <div>
                    <label className="label">Email</label>
                    <input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                </div>
                <div>
                    <label className="label">Contraseña</label>
                    <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                </div>
                {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
                <button className="btn btn--primary" disabled={loading}>
                    {loading ? 'Ingresando…' : 'Ingresar'}
                </button>
                <div className="muted">Tip: admin@example.com / admin123</div>
            </form>
            </div>
        </div>
    );
}