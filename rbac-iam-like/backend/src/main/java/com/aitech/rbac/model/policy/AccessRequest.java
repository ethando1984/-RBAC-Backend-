package com.aitech.rbac.model.policy;

import lombok.Data;
import java.util.Map;

/**
 * Access request context for policy evaluation
 */
@Data
public class AccessRequest {
    private String userId;
    private String namespace;
    private String action;
    private String resource;
    private Map<String, Object> context; // IP, time, MFA status, environment, etc.
}
