# Policy <-> Permission Matrix Conversion Design

This document outlines the architectural design for converting between a UI-friendly Permission Matrix and an AWS IAM-style JSON Policy Document.

## 1. Core Data Structures

### 1.1 Namespace-Action Registry (Source of Truth)
A static or dynamic registry defining valid Namespaces and their supported Actions. This ensures types are expanded correctly during wildcard processing and validation.

```typescript
// Type Definitions
type ActionType = 'create' | 'read' | 'update' | 'delete' | 'list' | 'manage';

interface NamespaceDefinition {
  key: string;           // e.g., "users", "billing"
  label: string;         // e.g., "User Management"
  supportedActions: ActionType[];
  isCritical?: boolean;  // Guardrail flag
}

interface Registry {
  [namespaceKey: string]: NamespaceDefinition;
}

// Example Registry
const PERMISSION_REGISTRY: Registry = {
  users: {
    key: 'users',
    label: 'User Management',
    supportedActions: ['read', 'create', 'update', 'delete', 'list']
  },
  billing: {
    key: 'billing',
    label: 'Billing & Invoices',
    // 'manage' might imply * wildcard
    supportedActions: ['read', 'manage']
  }
};
```

### 1.2 Permission Matrix (UI Representation)
A simplified 2D structure used by the Frontend to render the grid.

```typescript
// true = Allow, false = Inactive (Implicit Deny)
// Advanced implementation could use 'allow' | 'deny' | 'unset'
interface PermissionMatrix {
  [namespaceKey: string]: {
    [actionKey: string]: boolean; 
  }
}
```

### 1.3 IAM Policy Document (Backend/JSON Representation)
Standardized JSON format.

```typescript
interface PolicyStatement {
  Sid?: string;           // Stable Identifier, e.g., "AllowUsersRead"
  Effect: 'Allow' | 'Deny';
  Action: string | string[]; // e.g., "users:read" or ["users:read", "users:create"]
  Resource: string | string[]; // e.g., "*" or "arn:app:users:123"
}

interface PolicyDocument {
  Version: string;
  Statement: PolicyStatement[];
}
```

---

## 2. Algorithm: Matrix -> Policy JSON

**Goal**: Convert the grid state into a minimal, clean JSON document.

### Logic
1.  **Iterate** through each Namespace in the Matrix.
2.  **Collect Actions**: For each namespace, gather all actions set to `true`.
3.  **Wildcard Optimization**:
    *   Compare the collected actions against the Registry's `supportedActions`.
    *   If *all* supported actions are selected, collapse them into a single wildcard action: `namespace:*`.
4.  **Statement Generation**:
    *   Create a single `Allow` statement per namespace to keep the policy readable.
    *   Generate a stable `Sid` (e.g., `Allow{Namespace}{ActionsHash}` or simple `Allow{Namespace}`).
5.  **Clean Up**: Avoid creating statements with empty Action lists.

### Implementation (TypeScript)

```typescript
function convertMatrixToPolicy(matrix: PermissionMatrix, registry: Registry): PolicyDocument {
  const statements: PolicyStatement[] = [];

  for (const [nsKey, actionsMap] of Object.entries(matrix)) {
    const nsDef = registry[nsKey];
    if (!nsDef) continue; // Skip unknown namespaces

    const activeActions = Object.entries(actionsMap)
      .filter(([_, isActive]) => isActive)
      .map(([action, _]) => action);

    if (activeActions.length === 0) continue;

    // Check for Wildcard Optimization
    const allActions = nsDef.supportedActions;
    const isFullAccess = allActions.every(a => activeActions.includes(a));

    const finalActions = isFullAccess 
      ? [`${nsKey}:*`] 
      : activeActions.map(a => `${nsKey}:${a}`);

    statements.push({
      Sid: `Allow${capitalize(nsKey)}Access`,
      Effect: 'Allow',
      Action: finalActions,
      Resource: "*" // Default to global scope for matrix-based permissions
    });
  }

  return {
    Version: "2026-01-02",
    Statement: statements
  };
}
```

---

## 3. Algorithm: Policy JSON -> Matrix

**Goal**: accurate UI representation of effective permissions, handling overlaps and Deny overrides.

### Logic
1.  **Initialize Matrix**: Create a matrix where every cell is `false`.
2.  **Flatten Statements**:
    *   Separate statements into `Allows` and `Denies`.
3.  **Process Allows**:
    *   Iterate through each `Allow` statement.
    *   **Expand Wildcards**: If action is `ns:*`, verify against Registry which sub-actions exist for `ns`. Set all to `true`.
    *   **Direct Match**: If action is `ns:read`, set `matrix[ns][read] = true`.
4.  **Process Denies (Override)**:
    *   Iterate through `Deny` statements.
    *   Flip corresponding cells to `false`. (Optional: Mark as 'explicitly denied' for UI feedback).
5.  **Validation**: Log warnings for actions found in JSON that do not exist in Registry (Schema Mismatch).

### Implementation (TypeScript)

```typescript
function convertPolicyToMatrix(policy: PolicyDocument, registry: Registry): PermissionMatrix {
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
        const [ns, act] = actionStr.split(':');
        
        // Handle Global Wildcard *:*
        if (ns === '*' && act === '*') {
          Object.keys(matrix).forEach(n => 
            Object.keys(matrix[n]).forEach(a => matrix[n][a] = valueToSet)
          );
          return;
        }

        const nsDef = registry[ns];
        if (!nsDef) return; // Unknown namespace ignore

        // Handle Namespace Wildcard ns:*
        if (act === '*') {
          nsDef.supportedActions.forEach(a => matrix[ns][a] = valueToSet);
        } else {
          // Specific Action
          if (matrix[ns] && matrix[ns].hasOwnProperty(act)) {
            matrix[ns][act] = valueToSet;
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
```

---

## 4. Validation & Guardrails

### 4.1 Structural Validation
*   **Unique Sid**: Ensure no duplicate Sids in the `Statement` array.
*   **Schema Compliance**: Validate `Action` strings follow `namespace:action` format.

### 4.2 Semantic Validation (Business Logic)
*   **Registry Check**: Ensure every `Action` in the policy corresponds to a known entry in the Registry.
*   **Scope Mismatch**: Warning if `Resource` is specific (e.g., `user:123`) but Action is global (e.g., `listing`).

### 4.3 Safety Guardrails
*   **Critical Actions**: Flag statements that grant `delete` permissions on critical namespaces (e.g., `system`, `logs`).
*   **Admin Wildcard**: Require explicit confirmation loop if `*` or `admin:*` is detected.

```typescript
function validatePolicy(policy: PolicyDocument, registry: Registry): ValidationResult[] {
  const errors: ValidationResult[] = [];
  const sids = new Set<string>();

  policy.Statement.forEach(stmt => {
    // 1. Sid Uniqueness
    if (stmt.Sid) {
      if (sids.has(stmt.Sid)) errors.push({ level: 'error', msg: `Duplicate Sid: ${stmt.Sid}` });
      sids.add(stmt.Sid);
    }

    // 2. Dangerous Actions
    const actions = Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action];
    actions.forEach(act => {
      if (act.includes(':delete') || act === '*') {
        errors.push({ level: 'warning', msg: `High-risk permission detected: ${act}` });
      }
      
      // 3. Registry Check
      const [ns, actionKey] = act.split(':');
      if (ns !== '*' && !registry[ns]) {
         errors.push({ level: 'error', msg: `Unknown namespace: ${ns}` });
      }
    });
  });

  return errors;
}
```

---

## 5. Example Payloads

### Input: Permission Matrix
```json
{
  "users": { "read": true, "list": true, "create": false, "delete": false },
  "reports": { "read": true, "generate": true, "export": true } 
  // Assume 'reports' has [read, generate, export] -> Full Match
}
```

### Output: Policy JSON
```json
{
  "Version": "2026-01-02",
  "Statement": [
    {
      "Sid": "AllowUsersAccess",
      "Effect": "Allow",
      "Action": [ "users:read", "users:list" ],
      "Resource": "*"
    },
    {
      "Sid": "AllowReportsAccess",
      "Effect": "Allow",
      "Action": [ "reports:*" ],     // Collapsed to wildcard
      "Resource": "*"
    }
  ]
}
```
