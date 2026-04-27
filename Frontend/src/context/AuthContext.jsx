import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // The role is stored in the 'role' claim we added in the backend
                setUser({ 
                    email: decoded.sub, 
                    role: decoded.role,
                    id: decoded.userId 
                });
            } catch (err) {
                console.error("Invalid token", err);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        const { token } = response;
        
        const decoded = jwtDecode(token);
        const userData = { 
            email: decoded.sub, 
            role: decoded.role,
            id: decoded.userId 
        };
        
        localStorage.setItem('token', token);
        setUser(userData);
        return response;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
