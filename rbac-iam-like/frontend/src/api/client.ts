import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    login: (data: any) => client.post('/auth/login', data),
    me: () => client.get('/auth/me'),
};

export const api = {
    users: {
        list: (page?: number, size?: number, search?: string) => client.get('/users', { params: { page, size, search } }).then(r => r.data),
        get: (id: string) => client.get(`/users/${id}`).then(r => r.data),
        getAccess: (id: string) => client.get(`/access/${id}`).then(r => r.data),
        create: (data: any) => client.post('/users', data),
        update: (id: string, data: any) => client.put(`/users/${id}`, data),
        delete: (id: string) => client.delete(`/users/${id}`),
    },
    roles: {
        list: (page?: number, size?: number, search?: string) => client.get('/roles', { params: { page, size, search } }).then(r => r.data),
        get: (id: string) => client.get(`/roles/${id}`).then(r => r.data),
        getPermissions: (id: string) => client.get(`/role_permissions/${id}`).then(r => r.data),
        create: (data: any) => client.post('/roles', data),
        update: (id: string, data: any) => client.put(`/roles/${id}`, data),
        delete: (id: string) => client.delete(`/roles/${id}`),
        listAllPermissions: () => client.get('/role_permissions').then(r => r.data),
    },
    permissions: {
        list: () => client.get('/permissions').then(r => r.data),
        get: (id: string) => client.get(`/permissions/${id}`).then(r => r.data),
        getResourceAccess: (id: string) => client.get(`/resource_access/${id}`).then(r => r.data),
        listAllResourceAccess: () => client.get('/resource_access').then(r => r.data),
        create: (data: any) => client.post('/permissions', data),
        update: (id: string, data: any) => client.put(`/permissions/${id}`, data),
        delete: (id: string) => client.delete(`/permissions/${id}`),
    },
    policies: {
        seal: (id: string, scopeMatrix: any) => client.post(`/policies/${id}/seal`, scopeMatrix).then(r => r.data),
        getDocument: (id: string) => client.get(`/policies/${id}/document`).then(r => r.data),
        updateDocument: (id: string, policyDoc: any) => client.put(`/policies/${id}/document`, policyDoc).then(r => r.data),
        evaluate: (request: any) => client.post('/policies/evaluate', request).then(r => r.data),
    },
    assignments: {
        assignRole: (userId: string, roleId: string) => client.post('/user_roles', { userId, roleId }),
        revokeRole: (userId: string, roleId: string) => client.delete('/user_roles', { data: { userId, roleId } }),
        assignPermission: (roleId: string, permissionId: string) => client.post('/role_permissions', { roleId, permissionId }),
        revokePermission: (roleId: string, permissionId: string) => client.delete('/role_permissions', { data: { roleId, permissionId } }),
        assignResourceAccess: (data: { permissionId: string, namespaceId: string, actionTypeId: string }) => client.post('/resource_access', data),
        revokeResourceAccess: (data: { permissionId: string, namespaceId: string, actionTypeId: string }) => client.delete('/resource_access', { data }),
    },
    namespaces: {
        list: () => client.get('/namespaces').then(r => r.data),
    },
    actionTypes: {
        list: () => client.get('/action_types').then(r => r.data),
    },
    orders: {
        list: () => client.get('/orders').then(r => r.data),
        create: (data: any) => client.post('/orders', data),
        update: (id: string, data: any) => client.put(`/orders/${id}`, data),
        delete: (id: string) => client.delete(`/orders/${id}`),
    },
    inventory: {
        list: () => client.get('/inventory').then(r => r.data),
        get: (id: string) => client.get(`/inventory/${id}`).then(r => r.data),
        create: (data: any) => client.post('/inventory', data),
        update: (id: string, data: any) => client.put(`/inventory/${id}`, data),
        delete: (id: string) => client.delete(`/inventory/${id}`),
    }
};
