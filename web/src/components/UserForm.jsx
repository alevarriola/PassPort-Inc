import { useState } from 'react';

// Formulario para crear/editar usuario (admin)
export default function UserForm({ initial = { name: '', email: '', phone: '', password: '', role: 'USER' }, onSubmit, onCancel }) {
    
    // Estado del formulario y carga
    const [form, setForm] = useState(initial);
    const [saving, setSaving] = useState(false);

    // Maneja el submit
    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        await onSubmit(form).finally(() => setSaving(false));
    }


    return (
        <form className="stack" onSubmit={handleSubmit}>
            <input className="input" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="input" placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            {initial?.id ? null : (
            <input className="input" placeholder="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            )}
            <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
            </select>
            <div className="actions">
                <button className="btn btn--primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
                {onCancel && <button className="btn" type="button" onClick={onCancel}>Cancelar</button>}
            </div>
        </form>
    );
}