export interface User {
    userId: string;
    username: string;
    email: string;
    isActive: boolean;
}

export interface Role {
    roleId: string;
    roleName: string;
    description: string;
    systemRole: boolean;
}

export interface Permission {
    permissionId: string;
    permissionName: string;
    description: string;
}

export interface EffectiveAccess {
    userId: string;
    username: string;
    roles: EffectiveRole[];
}

export interface EffectiveRole {
    roleId: string;
    roleName: string;
    permissions: EffectivePermission[];
}

export interface EffectivePermission {
    permissionId: string;
    permissionName: string;
    namespaceKey: string;
    actionKey: string;
}
