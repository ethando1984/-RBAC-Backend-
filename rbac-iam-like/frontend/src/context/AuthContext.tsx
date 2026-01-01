import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, api } from '../api/client';

interface AuthContextType {
    user: any | null;
    effectiveAccess: any | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
    can: (namespace: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [effectiveAccess, setEffectiveAccess] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const profileRes = await authApi.me();
            const userData = profileRes.data;
            setUser(userData);
            if (userData?.userId) {
                const accessRes = await api.users.getAccess(userData.userId);
                setEffectiveAccess(accessRes?.[0] || null);
            }
        } catch (e) {
            console.error('Auth error', e);
            localStorage.removeItem('token');
            setUser(null);
            setEffectiveAccess(null);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchProfile().finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (token: string) => {
        localStorage.setItem('token', token);
        await fetchProfile();
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setEffectiveAccess(null);
    };

    const can = (namespace: string, action: string) => {
        if (!effectiveAccess) return false;
        // Super admin check or iterate roles/permissions
        return effectiveAccess.roles.some((role: any) =>
            role.permissions.some((p: any) =>
                (p.namespaceKey === namespace || p.namespaceKey === '*') &&
                (p.actionKey === action || p.actionKey === '*')
            )
        );
    };

    return (
        <AuthContext.Provider value={{ user, effectiveAccess, login, logout, isLoading, can }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
