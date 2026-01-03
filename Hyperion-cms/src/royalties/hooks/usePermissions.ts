import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    permissions: string[];
    [key: string]: any;
}

export const usePermissions = () => {
    const token = localStorage.getItem('token');
    let permissions: string[] = [];

    if (token) {
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            permissions = decoded.permissions || [];
        } catch (e) {
            console.error("Failed to decode token for permissions", e);
        }
    }

    const hasPermission = (permission: string) => {
        // Super admin check if needed, but usually exact match or namespace:action logic
        // For simplicity, checking exact string match as backend sends them
        // Backend tends to send 'namespace:action' in the permissions list claim.
        return permissions.includes(permission) || permissions.includes('*:*');
    };

    return { hasPermission, permissions };
};
