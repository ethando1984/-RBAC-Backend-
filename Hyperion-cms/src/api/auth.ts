import { jwtDecode } from 'jwt-decode';

export interface UserInfo {
    sub: string;
    email: string;
    roles: string[];
    permissions: string[];
    exp: number;
}

export const getUserInfo = (): UserInfo | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        return jwtDecode<UserInfo>(token);
    } catch (e) {
        return null;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};
