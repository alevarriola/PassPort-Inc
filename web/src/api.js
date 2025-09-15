import axios from 'axios';

// Configura la instancia de axios
export const api = axios.create({
    baseURL: 'http://localhost:4000',
    withCredentials: true, // importante para enviar/recibir la cookie HTTP-only
});

// Auth
export async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data.user;
}

// Cierra sesión
export async function logout() {
    await api.post('/auth/logout');
}

// Obtiene datos del usuario actual
export async function fetchMe() {
    const { data } = await api.get('/auth/me');
    return data.user;
}


// Usuarios (admin)
export async function listUsers() {
    const { data } = await api.get('/users');
    // Si es un array, lo devolvemos tal cual, si viene envuelto en { users: [...] }, devolvemos el array
    return Array.isArray(data) ? data : data.users;
}

// Crea un usuario (admin)
export async function createUser(payload) {
    const { data } = await api.post('/users', payload);
    return data.user ?? data;
}

// Ver un usuario (propio o admin)
export async function getUser(id) {
    const { data } = await api.get(`/users/${id}`);
    return data.user ?? data;
}

// Edita un usuario (propio o admin)
export async function updateUser(id, payload) {
    const { data } = await api.put(`/users/${id}`, payload);
    return data.user ?? data;
}

// Elimina un usuario (admin)
export async function deleteUser(id) {
const { data } = await api.delete(`/users/${id}`);
return data;
}