import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';


export default function Navbar() {
    const { user, logout } = useAuth();
    return (
        <header className="navbar">
            <div className="container navbar-inner">
                <div className="row">
                    <span className="brand">Proyecto Auth</span>
                </div>
                <nav className="nav">
                    {user ? (
                    <>
                        <Link className="link" to="/profile">Perfil</Link>
                    {user.role === 'ADMIN' && <Link className="link" to="/admin">Admin</Link>}
                    <button className="btn btn--ghost" onClick={logout}>Salir</button>
                    </>
                    ) : (
                    <Link className="btn btn--primary" to="/login">Login</Link>
                    )}
                </nav>
            </div>
        </header>
    );
}