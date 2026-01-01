export type ActionType = string;

export interface NamespaceDefinition {
    key: string;
    label: string;
    supportedActions: ActionType[];
}

export interface Registry {
    [namespaceKey: string]: NamespaceDefinition;
}

export interface PermissionMatrix {
    [namespaceKey: string]: {
        [actionKey: string]: boolean;
    };
}

export interface PolicyStatement {
    Sid?: string;
    Effect: 'Allow' | 'Deny';
    Action: string | string[];
    Resource: string | string[];
}

export interface PolicyDocument {
    Version: string;
    Statement: PolicyStatement[];
}

export interface ValidationResult {
    level: 'info' | 'warning' | 'error';
    msg: string;
}
