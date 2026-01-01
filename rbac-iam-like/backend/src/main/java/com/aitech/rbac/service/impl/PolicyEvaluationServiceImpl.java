package com.aitech.rbac.service.impl;

import com.aitech.rbac.model.policy.*;
import com.aitech.rbac.service.PolicyEvaluationService;
import com.aitech.rbac.mapper.UserMapper;
import com.aitech.rbac.mapper.RoleMapper;
import com.aitech.rbac.mapper.PermissionMapper;
import com.aitech.rbac.mapper.RolePermissionMapper;
import com.aitech.rbac.model.User;
import com.aitech.rbac.model.Role;
import com.aitech.rbac.model.Permission;
import com.aitech.rbac.model.RolePermission;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * AWS IAM-style Policy Evaluation Engine
 * 
 * Evaluation Rules:
 * 1. Explicit Deny ALWAYS wins
 * 2. If at least one Allow and no Deny → ALLOW
 * 3. Default → DENY
 */
@Service
@Slf4j
public class PolicyEvaluationServiceImpl implements PolicyEvaluationService {

    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final PermissionMapper permissionMapper;
    private final RolePermissionMapper rolePermissionMapper;
    private final ObjectMapper objectMapper;

    public PolicyEvaluationServiceImpl(
            UserMapper userMapper,
            RoleMapper roleMapper,
            PermissionMapper permissionMapper,
            RolePermissionMapper rolePermissionMapper) {
        this.userMapper = userMapper;
        this.roleMapper = roleMapper;
        this.permissionMapper = permissionMapper;
        this.rolePermissionMapper = rolePermissionMapper;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    @Override
    public AccessDecision evaluateAccess(AccessRequest request) {
        AccessDecision decision = new AccessDecision();
        decision.setMatchedStatements(new ArrayList<>());
        decision.setAppliedPolicies(new ArrayList<>());

        try {
            // Step 1: Get user
            User user = userMapper.findById(UUID.fromString(request.getUserId()));
            if (user == null) {
                decision.setAllowed(false);
                decision.setReason("User not found");
                return decision;
            }

            // Step 2: Get all user's roles
            List<Role> roles = roleMapper.findByUserId(user.getUserId());
            if (roles.isEmpty()) {
                decision.setAllowed(false);
                decision.setReason("User has no assigned roles");
                return decision;
            }

            // Step 3: Get all policies from all roles
            List<PolicyDocument> policies = new ArrayList<>();
            for (Role role : roles) {
                List<RolePermission> rolePerms = rolePermissionMapper.findByRoleId(role.getRoleId());
                for (RolePermission rp : rolePerms) {
                    Permission permission = permissionMapper.findById(rp.getPermissionId());
                    if (permission != null && permission.getPolicyDocument() != null) {
                        try {
                            PolicyDocument policy = parsePolicyDocument(permission.getPolicyDocument());
                            policies.add(policy);
                            decision.getAppliedPolicies().add(permission.getPermissionName());
                        } catch (Exception e) {
                            log.warn("Failed to parse policy document for permission {}", permission.getPermissionId(),
                                    e);
                        }
                    }
                }
            }

            if (policies.isEmpty()) {
                decision.setAllowed(false);
                decision.setReason("No valid policy documents found for user's roles");
                return decision;
            }

            // Step 4: Evaluate all statements - AWS IAM logic
            boolean hasExplicitDeny = false;
            boolean hasExplicitAllow = false;
            String denyReason = null;

            for (PolicyDocument policy : policies) {
                if (policy.getStatement() == null)
                    continue;

                for (PolicyStatement statement : policy.getStatement()) {
                    if (statementMatches(statement, request)) {
                        String stmtId = statement.getSid() != null ? statement.getSid() : "unnamed";
                        decision.getMatchedStatements().add(policy.getName() + ":" + stmtId);

                        if (statement.getEffect() == PolicyStatement.Effect.Deny) {
                            hasExplicitDeny = true;
                            denyReason = "Explicit Deny in policy: " + policy.getName() + " (Statement: " + stmtId
                                    + ")";
                        } else if (statement.getEffect() == PolicyStatement.Effect.Allow) {
                            hasExplicitAllow = true;
                        }
                    }
                }
            }

            // AWS IAM Rule: Explicit Deny ALWAYS wins
            if (hasExplicitDeny) {
                decision.setAllowed(false);
                decision.setReason(denyReason);
                return decision;
            }

            // AWS IAM Rule: If at least one Allow and no Deny → ALLOW
            if (hasExplicitAllow) {
                decision.setAllowed(true);
                decision.setReason("Access granted by policy");
                return decision;
            }

            // AWS IAM Rule: Default DENY
            decision.setAllowed(false);
            decision.setReason("No matching Allow statement (default deny)");
            return decision;

        } catch (Exception e) {
            log.error("Error evaluating access", e);
            decision.setAllowed(false);
            decision.setReason("Evaluation error: " + e.getMessage());
            return decision;
        }
    }

    /**
     * Check if a statement matches the access request
     */
    private boolean statementMatches(PolicyStatement statement, AccessRequest request) {
        // Check Action match
        boolean actionMatch = false;
        String requestAction = request.getNamespace() + ":" + request.getAction();

        if (statement.getAction() != null) {
            actionMatch = matchesActionList(statement.getAction(), requestAction);
        } else if (statement.getNotAction() != null) {
            actionMatch = !matchesActionList(statement.getNotAction(), requestAction);
        }

        if (!actionMatch) {
            return false;
        }

        // Check Resource match (if specified in statement)
        if (statement.getResource() != null) {
            String requestResource = request.getResource() != null ? request.getResource() : "*";
            if (!matchesResourceList(statement.getResource(), requestResource)) {
                return false;
            }
        } else if (statement.getNotResource() != null) {
            String requestResource = request.getResource() != null ? request.getResource() : "*";
            if (matchesResourceList(statement.getNotResource(), requestResource)) {
                return false;
            }
        }

        // Check Conditions (if specified)
        if (statement.getCondition() != null && !statement.getCondition().isEmpty()) {
            if (!evaluateConditions(statement.getCondition(), request.getContext())) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if request action matches any action in the list (with wildcard
     * support)
     */
    private boolean matchesActionList(List<String> actionPatterns, String requestAction) {
        for (String pattern : actionPatterns) {
            if (matchesPattern(pattern, requestAction)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if request resource matches any resource in the list (with wildcard
     * support)
     */
    private boolean matchesResourceList(List<String> resourcePatterns, String requestResource) {
        for (String pattern : resourcePatterns) {
            if (matchesPattern(pattern, requestResource)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Wildcard pattern matching (supports * and ? - AWS IAM style)
     * Examples:
     * - "orders:*" matches "orders:read", "orders:write"
     * - "*:delete" matches "orders:delete", "inventory:delete"
     * - "*" matches everything
     */
    private boolean matchesPattern(String pattern, String value) {
        if (pattern.equals("*")) {
            return true;
        }

        // Convert wildcard pattern to regex
        String regex = pattern
                .replace(".", "\\.")
                .replace("*", ".*")
                .replace("?", ".");

        return Pattern.matches(regex, value);
    }

    /**
     * Evaluate IAM-style conditions
     * Examples: IpAddress, DateGreaterThan, StringLike, etc.
     */
    private boolean evaluateConditions(Map<String, Map<String, Object>> conditions, Map<String, Object> context) {
        if (context == null) {
            context = new HashMap<>();
        }

        for (Map.Entry<String, Map<String, Object>> conditionEntry : conditions.entrySet()) {
            String conditionOperator = conditionEntry.getKey();
            Map<String, Object> conditionKeyValues = conditionEntry.getValue();

            for (Map.Entry<String, Object> kvEntry : conditionKeyValues.entrySet()) {
                String contextKey = kvEntry.getKey();
                Object expectedValue = kvEntry.getValue();
                Object actualValue = context.get(contextKey);

                if (!evaluateConditionOperator(conditionOperator, actualValue, expectedValue)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Evaluate individual condition operators
     */
    private boolean evaluateConditionOperator(String operator, Object actualValue, Object expectedValue) {
        if (actualValue == null) {
            return false;
        }

        switch (operator) {
            case "StringEquals":
                return actualValue.toString().equals(expectedValue.toString());

            case "StringLike":
                return matchesPattern(expectedValue.toString(), actualValue.toString());

            case "IpAddress":
                // Simple IP check (can be enhanced with CIDR)
                return actualValue.toString().equals(expectedValue.toString());

            case "Bool":
                return Boolean.parseBoolean(actualValue.toString()) == Boolean.parseBoolean(expectedValue.toString());

            default:
                log.warn("Unknown condition operator: {}", operator);
                return true; // Default to allowing if operator unknown
        }
    }

    @Override
    public PolicyDocument matrixToPolicyDocument(String policyName, String policyKey,
            Map<String, Map<String, Boolean>> scopeMatrix) {
        PolicyDocument document = new PolicyDocument();
        document.setVersion("2026-01-01");
        document.setId(UUID.randomUUID().toString());
        document.setName(policyName);
        document.setDescription("Policy generated from resource scope matrix");

        List<PolicyStatement> statements = new ArrayList<>();

        // Convert matrix to statements
        // scopeMatrix format: { namespace -> { action -> isAllowed } }
        for (Map.Entry<String, Map<String, Boolean>> namespaceEntry : scopeMatrix.entrySet()) {
            String namespace = namespaceEntry.getKey();
            Map<String, Boolean> actions = namespaceEntry.getValue();

            List<String> allowedActions = new ArrayList<>();
            for (Map.Entry<String, Boolean> actionEntry : actions.entrySet()) {
                if (Boolean.TRUE.equals(actionEntry.getValue())) {
                    allowedActions.add(namespace + ":" + actionEntry.getKey());
                }
            }

            if (!allowedActions.isEmpty()) {
                PolicyStatement statement = new PolicyStatement();
                statement.setSid("Allow_" + namespace.replace(":", "_"));
                statement.setEffect(PolicyStatement.Effect.Allow);
                statement.setAction(allowedActions);
                statement.setResource(Arrays.asList("*"));
                statements.add(statement);
            }
        }

        document.setStatement(statements);

        // Add metadata
        Map<String, Object> meta = new HashMap<>();
        meta.put("generatedAt", new Date().toString());
        meta.put("policyKey", policyKey);
        document.setMeta(meta);

        return document;
    }

    @Override
    public PolicyDocument parsePolicyDocument(String policyJson) {
        try {
            return objectMapper.readValue(policyJson, PolicyDocument.class);
        } catch (Exception e) {
            log.error("Failed to parse policy document", e);
            throw new RuntimeException("Invalid policy document JSON", e);
        }
    }

    @Override
    public String serializePolicyDocument(PolicyDocument policy) {
        try {
            return objectMapper.writeValueAsString(policy);
        } catch (Exception e) {
            log.error("Failed to serialize policy document", e);
            throw new RuntimeException("Failed to serialize policy document", e);
        }
    }
}
