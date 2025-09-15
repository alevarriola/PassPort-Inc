import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { listUsers, createUser, updateUser, deleteUser } from '../api';
import UsersTable from '../components/UsersTable';
import UserForm from '../components/UserForm';

// Página de administración (solo para admins)
export default function Admin() {

    // Hooks y estados
    const { user, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState('');

    // Carga la lista de usuarios
    async function load() {
        try {
            const data = await listUsers();
            setUsers(data ?? []);
        } catch (e) {
            setError('No se pudo cargar la lista');
        }
    }

    // Al montar, carga la lista
    useEffect(() => { load(); }, []);

    // Maneja la creación de un usuario
    async function handleCreate(payload) {
        await createUser(payload);
        setShowCreate(false);
        await load();
    }

    // Maneja la edición de un usuario
    async function handleUpdate(payload) {
        await updateUser(editing.id, payload);
        setEditing(null);
        await load();
    }

    // Maneja la eliminación de un usuario
    async function handleDelete(id) {
        if (!confirm('¿Eliminar usuario?')) return;
        await deleteUser(id);
        await load();
    }


    return (
        <div className="container stack-lg">
            <div className="space-between">
                <h2 className="heading">Panel Admin</h2>
                <div className="row">
                    <span className="muted">Hola, {user?.name}</span>
                    <button className="btn" onClick={logout}>Cerrar sesión</button>
                </div>
            </div>


            <div className="card">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                    <button className="btn btn--primary" onClick={() => setShowCreate((v) => !v)}>
                        {showCreate ? 'Cerrar' : 'Crear usuario'}
                    </button>
                    {error && <div className="status-danger">{error}</div>}
                </div>
            </div>


            {showCreate && (
            <div className="card stack">
                <h3 className="heading">Nuevo usuario</h3>
                 <UserForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
            </div>
            )}


            {editing && (
            <div className="card stack">
                 <h3 className="heading">Editar usuario</h3>
                 <UserForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
            </div>
            )}


            <UsersTable users={users} onEdit={setEditing} onDelete={handleDelete} />
        </div>
        );
}