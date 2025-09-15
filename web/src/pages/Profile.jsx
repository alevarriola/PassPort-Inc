import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { updateUser } from '../api';

// Página de perfil
export default function Profile() {
    
    // Hooks y estados
    const { user, setUser, logout } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    // Al cambiar el usuario, actualiza el formulario
    useEffect(() => {
        if (user) setForm({ name: user.name, email: user.email, phone: user.phone });
    }, [user]);

    // Maneja el submit del formulario
    async function onSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setMsg('');
        try {
            const updated = await updateUser(user.id, form);
            setUser(updated);
            setMsg('Perfil actualizado ✓');
        } catch (e) {
            setMsg('No se pudo actualizar');
        } finally {
            setSaving(false);
        }
    }

    // Si no hay usuario, no renderiza nada
    if (!user) return null;


    return (
        <div className="container stack-lg">
            <div className="space-between">
                <h2 className="heading">Mi perfil</h2>
                <button className="btn" onClick={logout}>Cerrar sesión</button>
            </div>
            <div className="card">
                <form className="stack" onSubmit={onSubmit}>
                    <div className="stack">
                        <label>Nombre</label>
                        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="stack">
                        <label>Email</label>
                        <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required />
                    </div>
                    <div className="stack">
                        <label>Teléfono</label>
                        <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                    </div>
                    <div className="actions">
                        <button className="btn btn--primary" disabled={saving} type="submit">{saving ? 'Guardando…' : 'Guardar'}</button>
                    </div>
                    {msg && <div className="muted">{msg}</div>}
                </form>
            </div>
        </div>
    );
}