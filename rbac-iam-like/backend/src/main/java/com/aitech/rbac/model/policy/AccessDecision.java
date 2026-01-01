package com.aitech.rbac.model.policy;

import lombok.Data;
import java.util.List;

/**
 * Result of policy evaluation
 */
@Data
public class AccessDecision {
    private boolean allowed;
    private String reason;
    private List<String> matchedStatements;
    private List<String> appliedPolicies;
}
