package com.aitech.rbac.security;

import java.util.UUID;

public interface PermissionService {
    boolean can(String namespace, String action);

    boolean can(String permission); // "namespace:action"

    boolean canInCategory(UUID categoryId, String namespace, String action);

    PermissionDecision evaluate(String namespace, String action, UUID categoryId, String resourceId);

    String getCurrentUserId();

    String getCurrentUserEmail();
}
