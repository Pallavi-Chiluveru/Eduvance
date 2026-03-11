import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

    // Fetch current user
    const loadUser = useCallback(async () => {
        if (!accessToken) {
            setLoading(false);
            return;
        }
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.data.user);
        } catch {
            // Token invalid — clear
            localStorage.removeItem('accessToken');
            setAccessToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = useCallback(async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { user: userData, accessToken: token } = res.data.data;
        localStorage.setItem('accessToken', token);
        setAccessToken(token);
        setUser(userData);
        return userData;
    }, []);

    const register = useCallback(async (userData) => {
        const res = await api.post('/auth/register', userData);
        const { user: newUser, accessToken: token } = res.data.data;
        localStorage.setItem('accessToken', token);
        setAccessToken(token);
        setUser(newUser);
        return newUser;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // ignore
        }
        localStorage.removeItem('accessToken');
        setAccessToken(null);
        setUser(null);
    }, []);

    const hasRole = useCallback(
        (role) => user?.role === role,
        [user]
    );

    const value = {
        user,
        loading,
        accessToken,
        login,
        register,
        logout,
        hasRole,
        loadUser,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
