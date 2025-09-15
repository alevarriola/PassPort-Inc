export default function UsersTable({ users, onEdit, onDelete }) {
    return (
        <div className="card">
            <table className="table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Rol</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {users?.map((u) => (
                    <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>{u.role}</td>
                        <td style={{ textAlign: 'right' }}>
                            <div className="actions" style={{ justifyContent: 'flex-end' }}>
                                <button className="btn" onClick={() => onEdit(u)}>Editar</button>
                                <button className="btn btn--danger" onClick={() => onDelete(u.id)}>Eliminar</button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}