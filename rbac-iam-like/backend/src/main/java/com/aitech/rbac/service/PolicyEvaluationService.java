package com.aitech.rbac.service;

import com.aitech.rbac.model.policy.AccessRequest;
import com.aitech.rbac.model.policy.AccessDecision;
import com.aitech.rbac.model.policy.PolicyDocument;

/**
 * AWS IAM-style policy evaluation engine
 */
public interface PolicyEvaluationService {

    /**
     * Evaluate if an access request should be allowed based on user's roles and
     * policies.
     * Implements AWS IAM evaluation logic:
     * 1. Explicit Deny > Allow
     * 2. Default Deny
     * 3. Supports wildcards and conditions
     */
    AccessDecision evaluateAccess(AccessRequest request);

    /**
     * Convert resource scope matrix to AWS IAM-style policy JSON
     */
    PolicyDocument matrixToPolicyDocument(String policyName, String policyKey,
            java.util.Map<String, java.util.Map<String, Boolean>> scopeMatrix);

    /**
     * Parse policy document JSON string
     */
    PolicyDocument parsePolicyDocument(String policyJson);

    /**
     * Serialize policy document to JSON string
     */
    String serializePolicyDocument(PolicyDocument policy);
}
