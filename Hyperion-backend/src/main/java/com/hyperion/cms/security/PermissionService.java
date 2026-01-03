package com.hyperion.cms.security;

import java.util.UUID;

public interface PermissionService {
    boolean can(String namespace, String action);

    boolean can(String permission); // "namespace:action"

    boolean canInCategory(UUID categoryId, String namespace, String action);

    PermissionDecision evaluate(String namespace, String action, UUID categoryId, String resourceId);

    String getCurrentUserId();

    String getCurrentUserEmail();

    default void requirePermission(String namespace, String action) {
        if (!can(namespace, action)) {
            PermissionDecision decision = PermissionDecision.builder()
                    .allowed(false)
                    .namespace(namespace)
                    .action(action)
                    .reasonCode(DecisionReason.DENIED_BY_DEFAULT)
                    .source("MANUAL_CHECK")
                    .build();
            throw new PermissionDeniedException(decision);
        }
    }
}
