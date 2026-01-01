import { type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface GuardProps {
    namespace: string;
    action: string;
    children: ReactNode;
    fallback?: ReactNode;
}

export const Guard = ({ namespace, action, children, fallback = null }: GuardProps) => {
    const { can } = useAuth();

    if (can(namespace, action)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
