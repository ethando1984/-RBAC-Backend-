import { type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface GuardProps {
    namespace?: string;
    action?: string;
    role?: string;
    children: ReactNode;
    fallback?: ReactNode;
}

export const Guard = ({ namespace, action, role, children, fallback = null }: GuardProps) => {
    const { can, hasRole } = useAuth();

    const hasPermission = (namespace && action) ? can(namespace, action) : true;
    const hasRequiredRole = role ? hasRole(role) : true;

    if (hasPermission && hasRequiredRole) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
