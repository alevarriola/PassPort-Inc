import { createContext, useContext, useEffect, useState } from 'react';
import { fetchMe, login as apiLogin, logout as apiLogout } from '../api';

// Contexto de autenticación
const AuthContext = createContext();

// Proveedor del contexto
export function AuthProvider({ children }) {
        // Estado del usuario y carga inicial
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);

        // Al montar, intenta obtener datos del usuario actual
        useEffect(() => {
            (async () => {
            try {
            const me = await fetchMe();
            setUser(me);
            } catch (_) {
            setUser(null);
            } finally {
            setLoading(false);
            }
            })();
        }, []);

        // Funciones de login y logout
        async function login(email, password) {
            const u = await apiLogin(email, password);
            setUser(u);
            return u;
        }


        async function logout() {
            await apiLogout();
            setUser(null);
        }


        return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
        {children}
        </AuthContext.Provider>
        );
    }


export function useAuth() {
    return useContext(AuthContext);
}