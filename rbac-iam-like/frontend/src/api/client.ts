import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
    auth: {
        login: (credentials: any) => axiosInstance.post('/auth/login', credentials).then(res => res.data),
        me: () => axiosInstance.get('/auth/me').then(res => res.data),
    },
    users: {
        list: (params?: any) => axiosInstance.get('/users', { params }).then(res => res.data),
        get: (id: string) => axiosInstance.get(`/users/${id}`).then(res => res.data),
        create: (data: any) => axiosInstance.post('/users', data).then(res => res.data),
        update: (id: string, data: any) => axiosInstance.put(`/users/${id}`, data).then(res => res.data),
        delete: (id: string) => axiosInstance.delete(`/users/${id}`),
        assignRole: (userId: string, roleId: string) => axiosInstance.post('/user-roles', { userId, roleId }),
        removeRole: (userId: string, roleId: string) => axiosInstance.delete('/user-roles', { data: { userId, roleId } }),
        getAccess: (id: string) => axiosInstance.get(`/access/${id}`).then(res => res.data),
    },
    roles: {
        list: (params?: any) => axiosInstance.get('/roles', { params }).then(res => res.data),
        get: (id: string) => axiosInstance.get(`/roles/${id}`).then(res => res.data),
        create: (data: any) => axiosInstance.post('/roles', data).then(res => res.data),
        update: (id: string, data: any) => axiosInstance.put(`/roles/${id}`, data).then(res => res.data),
        delete: (id: string) => axiosInstance.delete(`/roles/${id}`),
        listPermissions: (roleId: string) => axiosInstance.get(`/roles/${roleId}/permissions`).then(res => res.data),
        listAllPermissions: () => axiosInstance.get('/role-permissions').then(res => res.data),
    },
    permissions: {
        list: () => axiosInstance.get('/permissions').then(res => res.data), // Legacy?
        listAllResourceAccess: () => axiosInstance.get('/resource-access').then(res => res.data),
    },
    policies: {
        search: (params?: any) => axiosInstance.get('/policies', { params }).then(res => res.data),
        getImpact: (id: string) => axiosInstance.get(`/policies/${id}/impact`).then(res => res.data),
        seal: (id: string, data: { matrix: any, confirmImpact: boolean }) => axiosInstance.post(`/policies/${id}/seal`, data).then(res => res.data),
        getVersions: (id: string) => axiosInstance.get(`/policies/${id}/versions`).then(res => res.data),
        rollback: (id: string, versionId: string) => axiosInstance.post(`/policies/${id}/rollback/${versionId}`).then(res => res.data),
        create: (data: any) => axiosInstance.post('/permissions', data).then(res => res.data),
        delete: (id: string) => axiosInstance.delete(`/permissions/${id}`),
    },
    audit: {
        list: (params?: any) => axiosInstance.get('/audit-logs', { params }).then(res => res.data),
    },
    registry: {
        get: () => axiosInstance.get('/registry').then(res => res.data),
    },
    namespaces: {
        list: () => axiosInstance.get('/namespaces').then(res => res.data),
        create: (data: any) => axiosInstance.post('/namespaces', data).then(res => res.data),
        update: (id: string, data: any) => axiosInstance.put(`/namespaces/${id}`, data).then(res => res.data),
        delete: (id: string) => axiosInstance.delete(`/namespaces/${id}`),
    },
    actionTypes: {
        list: () => axiosInstance.get('/action-types').then(res => res.data),
        create: (data: any) => axiosInstance.post('/action-types', data).then(res => res.data),
        update: (id: string, data: any) => axiosInstance.put(`/action-types/${id}`, data).then(res => res.data),
        delete: (id: string) => axiosInstance.delete(`/action-types/${id}`),
    },
    assignments: {
        assignPermission: (roleId: string, permissionId: string) => axiosInstance.post(`/roles/${roleId}/permissions/${permissionId}`),
        revokePermission: (roleId: string, permissionId: string) => axiosInstance.delete(`/roles/${roleId}/permissions/${permissionId}`),
        assignResourceAccess: (data: any) => axiosInstance.post('/resource-access', data),
        revokeResourceAccess: (data: any) => axiosInstance.delete('/resource-access', { data }),
    },
    orders: {
        list: () => axiosInstance.get('/orders').then(res => res.data),
        get: (id: string) => axiosInstance.get(`/orders/${id}`).then(res => res.data),
    },
    inventory: {
        list: () => axiosInstance.get('/inventory').then(res => res.data),
        get: (id: string) => axiosInstance.get(`/inventory/${id}`).then(res => res.data),
    }
};
