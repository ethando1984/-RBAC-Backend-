package com.aitech.rbac.controller;

import com.aitech.rbac.model.policy.*;
import com.aitech.rbac.service.PolicyEvaluationService;
import com.aitech.rbac.service.PermissionService;
import com.aitech.rbac.model.Permission;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import lombok.extern.slf4j.Slf4j;

import jakarta.validation.Valid;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Policy Management and Evaluation API
 * AWS IAM-style policy system for enterprise-grade access control
 */
@Slf4j
@RestController
@RequestMapping("/api/policies")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class PolicyController {

    private final PolicyEvaluationService policyEvaluationService;
    private final PermissionService permissionService;

    public PolicyController(PolicyEvaluationService policyEvaluationService,
            PermissionService permissionService) {
        this.policyEvaluationService = policyEvaluationService;
        this.permissionService = permissionService;
    }

    /**
     * List all sealed policies
     * GET /api/policies
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listPolicies() {
        log.info("Listing all sealed policies");

        List<Permission> permissions = permissionService.getAll();
        List<Map<String, Object>> policies = permissions.stream()
                .filter(p -> p.getPolicyDocument() != null && !p.getPolicyDocument().isEmpty())
                .map(p -> {
                    Map<String, Object> policy = new HashMap<>();
                    policy.put("permissionId", p.getPermissionId());
                    policy.put("permissionName", p.getPermissionName());
                    policy.put("permissionKey", p.getPermissionKey());
                    policy.put("description", p.getDescription());
                    policy.put("attachedRoleCount", p.getAttachedRoleCount());
                    policy.put("hasPolicy", true);

                    try {
                        PolicyDocument doc = policyEvaluationService.parsePolicyDocument(p.getPolicyDocument());
                        policy.put("statementCount", doc.getStatement() != null ? doc.getStatement().size() : 0);
                    } catch (Exception e) {
                        log.warn("Failed to parse policy document for permission {}", p.getPermissionId());
                        policy.put("statementCount", 0);
                    }

                    return policy;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(policies);
    }

    /**
     * Get policy statistics
     * GET /api/policies/{id}/stats
     */
    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getPolicyStats(@PathVariable UUID id) {
        log.info("Getting statistics for policy: {}", id);

        Permission permission = permissionService.getById(id);
        if (permission == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found");
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("permissionId", permission.getPermissionId());
        stats.put("permissionName", permission.getPermissionName());
        stats.put("attachedRoleCount", permission.getAttachedRoleCount());
        stats.put("resourceAccessCount", permission.getResourceAccessCount());
        stats.put("isSealed", permission.getPolicyDocument() != null && !permission.getPolicyDocument().isEmpty());

        if (permission.getPolicyDocument() != null && !permission.getPolicyDocument().isEmpty()) {
            try {
                PolicyDocument doc = policyEvaluationService.parsePolicyDocument(permission.getPolicyDocument());
                stats.put("version", doc.getVersion());
                stats.put("statementCount", doc.getStatement() != null ? doc.getStatement().size() : 0);

                // Count actions
                int totalActions = 0;
                int allowActions = 0;
                int denyActions = 0;

                if (doc.getStatement() != null) {
                    for (PolicyStatement stmt : doc.getStatement()) {
                        if (stmt.getAction() != null) {
                            totalActions += stmt.getAction().size();
                            if (stmt.getEffect() == PolicyStatement.Effect.Allow) {
                                allowActions += stmt.getAction().size();
                            } else if (stmt.getEffect() == PolicyStatement.Effect.Deny) {
                                denyActions += stmt.getAction().size();
                            }
                        }
                    }
                }

                stats.put("totalActions", totalActions);
                stats.put("allowActions", allowActions);
                stats.put("denyActions", denyActions);

            } catch (Exception e) {
                log.error("Failed to parse policy document for stats", e);
                stats.put("parseError", true);
            }
        }

        return ResponseEntity.ok(stats);
    }

    /**
     * Seal Scope Configuration
     * Converts the UI matrix to AWS IAM-style JSON policy document
     * POST /api/policies/{id}/seal
     */
    @PostMapping("/{id}/seal")
    public ResponseEntity<Map<String, Object>> sealScopeConfiguration(
            @PathVariable UUID id,
            @RequestBody Map<String, Map<String, Boolean>> scopeMatrix) {

        log.info("Sealing policy configuration for permission: {}", id);

        // Validate scope matrix
        if (scopeMatrix == null || scopeMatrix.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Scope matrix cannot be empty");
        }

        Permission permission = permissionService.getById(id);
        if (permission == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found");
        }

        try {
            // Convert matrix to policy document
            PolicyDocument policyDoc = policyEvaluationService.matrixToPolicyDocument(
                    permission.getPermissionName(),
                    permission.getPermissionKey(),
                    scopeMatrix);

            // Serialize to JSON
            String policyJson = policyEvaluationService.serializePolicyDocument(policyDoc);

            // Update permission with policy document
            permission.setPolicyDocument(policyJson);
            permissionService.update(permission);

            log.info("Policy sealed successfully for permission: {} with {} statements",
                    id, policyDoc.getStatement() != null ? policyDoc.getStatement().size() : 0);

            // Return response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("policyDocument", policyDoc);
            response.put("message", "Policy sealed successfully");
            response.put("affectedRoles", permission.getAttachedRoleCount());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Failed to seal policy for permission: {}", id, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to seal policy: " + e.getMessage());
        }
    }

    /**
     * Get Policy Document
     * GET /api/policies/{id}/document
     */
    @GetMapping("/{id}/document")
    public ResponseEntity<PolicyDocument> getPolicyDocument(@PathVariable UUID id) {
        log.info("Retrieving policy document for: {}", id);

        Permission permission = permissionService.getById(id);
        if (permission == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found");
        }

        if (permission.getPolicyDocument() == null || permission.getPolicyDocument().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Policy document not found. Please seal the policy configuration first.");
        }

        try {
            PolicyDocument policyDoc = policyEvaluationService.parsePolicyDocument(permission.getPolicyDocument());
            return ResponseEntity.ok(policyDoc);
        } catch (Exception e) {
            log.error("Failed to parse policy document for: {}", id, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to parse policy document: " + e.getMessage());
        }
    }

    /**
     * Update Policy Document
     * PUT /api/policies/{id}/document
     */
    @PutMapping("/{id}/document")
    public ResponseEntity<Map<String, Object>> updatePolicyDocument(
            @PathVariable UUID id,
            @RequestBody PolicyDocument policyDocument) {

        log.info("Updating policy document for: {}", id);

        Permission permission = permissionService.getById(id);
        if (permission == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found");
        }

        try {
            String policyJson = policyEvaluationService.serializePolicyDocument(policyDocument);
            permission.setPolicyDocument(policyJson);
            permissionService.update(permission);

            log.info("Policy document updated successfully for: {}", id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Policy document updated");
            response.put("affectedRoles", permission.getAttachedRoleCount());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to update policy document for: {}", id, e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid policy document: " + e.getMessage());
        }
    }

    /**
     * Evaluate Access Request
     * POST /api/policies/evaluate
     */
    @PostMapping("/evaluate")
    public ResponseEntity<AccessDecision> evaluateAccess(@RequestBody AccessRequest request) {
        log.debug("Evaluating access request - User: {}, Namespace: {}, Action: {}",
                request.getUserId(), request.getNamespace(), request.getAction());

        // Validate request
        if (request.getUserId() == null || request.getNamespace() == null || request.getAction() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "userId, namespace, and action are required");
        }

        try {
            AccessDecision decision = policyEvaluationService.evaluateAccess(request);

            log.info("Access evaluation result - User: {}, Action: {}:{}, Allowed: {}",
                    request.getUserId(), request.getNamespace(), request.getAction(), decision.isAllowed());

            return ResponseEntity.ok(decision);

        } catch (Exception e) {
            log.error("Failed to evaluate access request", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to evaluate access: " + e.getMessage());
        }
    }

    /**
     * Test Policy Evaluation (for debugging)
     * POST /api/policies/test-evaluate
     */
    @PostMapping("/test-evaluate")
    public ResponseEntity<Map<String, Object>> testEvaluate(@RequestBody Map<String, String> params) {
        log.info("Test policy evaluation - Params: {}", params);

        AccessRequest request = new AccessRequest();
        request.setUserId(params.get("userId"));
        request.setNamespace(params.get("namespace"));
        request.setAction(params.get("action"));
        request.setResource(params.getOrDefault("resource", "*"));

        // Add context if provided
        if (params.containsKey("ipAddress")) {
            Map<String, Object> context = new HashMap<>();
            context.put("ipAddress", params.get("ipAddress"));
            if (params.containsKey("mfaAuthenticated")) {
                context.put("mfaAuthenticated", params.get("mfaAuthenticated"));
            }
            request.setContext(context);
        }

        AccessDecision decision = policyEvaluationService.evaluateAccess(request);

        Map<String, Object> response = new HashMap<>();
        response.put("request", request);
        response.put("decision", decision);
        response.put("timestamp", new Date());

        return ResponseEntity.ok(response);
    }

    /**
     * Delete/Unseal Policy Document
     * DELETE /api/policies/{id}/document
     */
    @DeleteMapping("/{id}/document")
    public ResponseEntity<Map<String, Object>> unsealPolicy(@PathVariable UUID id) {
        log.info("Unsealing policy document for: {}", id);

        Permission permission = permissionService.getById(id);
        if (permission == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Policy not found");
        }

        permission.setPolicyDocument(null);
        permissionService.update(permission);

        log.info("Policy unsealed successfully for: {}", id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Policy unsealed successfully");

        return ResponseEntity.ok(response);
    }
}
