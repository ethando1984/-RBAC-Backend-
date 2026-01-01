import type { PermissionMatrix, PolicyDocument, PolicyStatement, Registry, ValidationResult } from './policy-types';

/**
 * Helper to capitalize string for Sid generation
 */
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Converts a Permission Matrix (UI state) into an AWS IAM-style Policy Document.
 * 
 * Rules:
 * - Groups actions by namespace
 * - Collapses all actions to 'ns:*' if full coverage matches registry
 * - Generates stable Sids
 * - Returns minimal statement list (Allows only)
 */
export function convertMatrixToPolicy(matrix: PermissionMatrix, registry: Registry): PolicyDocument {
    const statements: PolicyStatement[] = [];

    const sortedNamespaces = Object.keys(matrix).sort();

    for (const nsKey of sortedNamespaces) {
        const actionsMap = matrix[nsKey];
        const nsDef = registry[nsKey];

        if (!nsDef) continue; // Skip unknown namespaces

        // Get all active actions for this namespace
        const activeActions = Object.entries(actionsMap)
            .filter(([_, isActive]) => isActive)
            .map(([action, _]) => action)
            .sort(); // Sort for stability

        if (activeActions.length === 0) continue;

        // Wildcard Optimization Check
        const allSupported = nsDef.supportedActions;
        // Check if every supported action is active
        const isFullAccess = allSupported.length > 0 && allSupported.every(a => activeActions.includes(a));

        const finalActions = isFullAccess
            ? [`${nsKey}:*`]
            : activeActions.map(a => `${nsKey}:${a}`);

        statements.push({
            Sid: `Allow${capitalize(nsKey)}Access`,
            Effect: 'Allow',
            Action: finalActions.length === 1 ? finalActions[0] : finalActions,
            Resource: "*" // Default to global scope resource
        });
    }

    return {
        Version: "2026-01-02",
        Statement: statements
    };
}

/**
 * Converts an IAM Policy Document back to a Permission Matrix.
 * 
 * Rules:
 * - Initializes matrix to false based on Registry
 * - Applies Allows
 * - Applies Denies (Override)
 * - Expands wildcards (ns:* and *:) based on Registry
 */
export function convertPolicyToMatrix(policy: PolicyDocument, registry: Registry): PermissionMatrix {
    // 1. Initialize empty matrix
    const matrix: PermissionMatrix = {};
    Object.keys(registry).forEach(ns => {
        matrix[ns] = {};
        registry[ns].supportedActions.forEach(act => matrix[ns][act] = false);
    });

    const allows = policy.Statement.filter(s => s.Effect === 'Allow');
    const denies = policy.Statement.filter(s => s.Effect === 'Deny');

    const applyActions = (statements: PolicyStatement[], valueToSet: boolean) => {
        statements.forEach(stmt => {
            const actions = Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action];

            actions.forEach(actionStr => {
                const parts = actionStr.split(':');
                if (parts.length !== 2) {
                    // Handle edge case of plain "*" if present (Global Admin)
                    if (actionStr === '*') {
                        Object.keys(matrix).forEach(n =>
                            Object.keys(matrix[n]).forEach(a => matrix[n][a] = valueToSet)
                        );
                    }
                    return;
                }

                const [ns, act] = parts;

                // Handle Global Wildcard *:*
                if (ns === '*' && act === '*') {
                    Object.keys(matrix).forEach(n =>
                        Object.keys(matrix[n]).forEach(a => matrix[n][a] = valueToSet)
                    );
                    return;
                }

                // Handle specific namespace
                const nsDef = registry[ns];
                if (!nsDef && ns !== '*') return; // Unknown namespace ignore (unless wildcard)

                if (ns === '*') {
                    // *:action - Apply action to ALL namespaces that support it
                    Object.keys(registry).forEach(n => {
                        if (act === '*') {
                            // *:* handled above, but technically this hits it too
                            Object.keys(matrix[n]).forEach(a => matrix[n][a] = valueToSet);
                        } else {
                            if (registry[n].supportedActions.includes(act)) {
                                matrix[n][act] = valueToSet;
                            }
                        }
                    });
                } else if (nsDef) {
                    // Specific Namespace
                    if (act === '*') {
                        // ns:* - All actions in namespace
                        nsDef.supportedActions.forEach(a => matrix[ns][a] = valueToSet);
                    } else {
                        // ns:action
                        if (matrix[ns] && Object.prototype.hasOwnProperty.call(matrix[ns], act)) {
                            matrix[ns][act] = valueToSet;
                        }
                    }
                }
            });
        });
    };

    // 2. Apply Allow
    applyActions(allows, true);

    // 3. Apply Deny (Overrides)
    applyActions(denies, false);

    return matrix;
}

/**
 * Validates a Policy Document against structural and security rules.
 */
export function validatePolicy(policy: PolicyDocument, registry: Registry): ValidationResult[] {
    const errors: ValidationResult[] = [];
    const sids = new Set<string>();

    if (!policy.Statement) return [{ level: 'error', msg: 'Policy is missing "Statement" array.' }];

    policy.Statement.forEach((stmt, index) => {
        // 1. Sid Uniqueness
        if (stmt.Sid) {
            if (sids.has(stmt.Sid)) {
                errors.push({ level: 'error', msg: `Duplicate Sid detected: "${stmt.Sid}" at Statement[${index}]` });
            }
            sids.add(stmt.Sid);
        }

        // 2. Action Analysis
        const actions = Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action];
        actions.forEach(act => {
            // Guardrail: Dangerous Actions
            if (act.includes(':delete') || act === '*' || act.includes('admin:')) {
                errors.push({ level: 'warning', msg: `High-risk permission detected: "${act}". Ensure this is intended.` });
            }

            // Schema Validation
            if (act === '*') return;

            const parts = act.split(':');
            if (parts.length !== 2) {
                errors.push({ level: 'error', msg: `Invalid Action format: "${act}". Expected "namespace:action".` });
                return;
            }

            const [ns, actionKey] = parts;
            if (ns === '*') return; // Wildcard namespace valid

            const nsDef = registry[ns];
            if (!nsDef) {
                errors.push({ level: 'error', msg: `Unknown namespace: "${ns}". Not found in registry.` });
            } else {
                if (actionKey !== '*' && !nsDef.supportedActions.includes(actionKey)) {
                    errors.push({ level: 'error', msg: `Unknown action: "${actionKey}" for namespace "${ns}".` });
                }
            }
        });
    });

    return errors;
}
