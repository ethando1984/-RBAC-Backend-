package com.aitech.rbac.security;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class PermissionDecision {
    private boolean allowed;
    private DecisionReason reasonCode;
    private String matchedPolicy;
    private String matchedRole;
    private String source; // JWT or REMOTE_IAM
    private String namespace;
    private String action;
    private UUID categoryId;
    private String resourceId;
}
