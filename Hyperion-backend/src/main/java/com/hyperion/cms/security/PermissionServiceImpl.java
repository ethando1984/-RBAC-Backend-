package com.hyperion.cms.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final IamCenterClient iamCenterClient;

    @Override
    public boolean can(String namespace, String action) {
        return evaluate(namespace, action, null, null).isAllowed();
    }

    @Override
    public boolean can(String permission) {
        if (permission == null || !permission.contains(":")) {
            return false;
        }
        String[] parts = permission.split(":", 2);
        return can(parts[0], parts[1]);
    }

    @Override
    public boolean canInCategory(UUID categoryId, String namespace, String action) {
        return evaluate(namespace, action, categoryId, null).isAllowed();
    }

    @Override
    public PermissionDecision evaluate(String namespace, String action, UUID categoryId, String resourceId) {
        // Validation
        if ("*".equals(namespace) && "*".equals(action)) {
            // Reject *:* unless super-admin is explicitly checked elsewhere or this is a
            // super-admin check
            // For now, let's treat it as a normal evaluation but usually *:* is restricted.
        }

        // 1. Fast path: JWT claims
        PermissionDecision decision = evaluateViaJwt(namespace, action, categoryId);

        // If JWT doesn't explicitly allow, but also doesn't explicitly deny (default
        // deny),
        // OR if it's a category scoped check that wasn't in JWT, try remote IAM.
        if (!decision.isAllowed() && decision.getReasonCode() == DecisionReason.DENIED_BY_DEFAULT) {
            decision = evaluateViaRemote(namespace, action, categoryId, resourceId);
        }

        return decision;
    }

    private PermissionDecision evaluateViaJwt(String namespace, String action, UUID categoryId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof JwtAuthenticationToken jwtAuth)) {
            return PermissionDecision.builder()
                    .allowed(false)
                    .reasonCode(DecisionReason.DENIED_BY_DEFAULT)
                    .build();
        }

        Jwt jwt = jwtAuth.getToken();
        List<String> globalPermissions = jwt.getClaimAsStringList("permissions");
        List<Map<String, Object>> categoryScopes = jwt.getClaim("categoryScopes");

        // 1. Check Category Scopes for Explicit Deny (Overrides everything for this
        // category)
        if (categoryId != null && categoryScopes != null) {
            for (Map<String, Object> scope : categoryScopes) {
                String scopeCatId = (String) scope.get("categoryId");
                if (scopeCatId != null && scopeCatId.equals(categoryId.toString())) {
                    List<String> denyList = (List<String>) scope.get("deny");
                    if (denyList != null && (denyList.contains(namespace + ":" + action)
                            || denyList.contains(namespace + ":*")
                            || denyList.contains("*:*"))) {
                        return PermissionDecision.builder()
                                .allowed(false)
                                .reasonCode(DecisionReason.DENIED_BY_EXPLICIT_DENY)
                                .source("JWT")
                                .namespace(namespace)
                                .action(action)
                                .categoryId(categoryId)
                                .build();
                    }

                    // 2. Check Category Scopes for Allow (Specific category allow)
                    List<String> allowList = (List<String>) scope.get("allow");
                    if (allowList != null && (allowList.contains(namespace + ":" + action)
                            || allowList.contains(namespace + ":*")
                            || allowList.contains("*:*"))) {
                        return PermissionDecision.builder()
                                .allowed(true)
                                .reasonCode(DecisionReason.ALLOWED_BY_JWT)
                                .source("JWT")
                                .namespace(namespace)
                                .action(action)
                                .categoryId(categoryId)
                                .build();
                    }
                }
            }
        }

        // 3. Check Global Permissions for Allow
        if (globalPermissions != null) {
            if (globalPermissions.contains("*:*") || globalPermissions.contains(namespace + ":*")
                    || globalPermissions.contains(namespace + ":" + action)) {
                return PermissionDecision.builder()
                        .allowed(true)
                        .reasonCode(DecisionReason.ALLOWED_BY_JWT)
                        .source("JWT")
                        .namespace(namespace)
                        .action(action)
                        .categoryId(categoryId)
                        .build();
            }
        }

        return PermissionDecision.builder()
                .allowed(false)
                .reasonCode(DecisionReason.DENIED_BY_DEFAULT)
                .source("JWT")
                .namespace(namespace)
                .action(action)
                .categoryId(categoryId)
                .build();
    }

    private PermissionDecision evaluateViaRemote(String namespace, String action, UUID categoryId, String resourceId) {
        String userId = getCurrentUserId();
        String correlationId = UUID.randomUUID().toString(); // In real app, trace from MDC

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userToken = null;
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            userToken = jwtAuth.getToken().getTokenValue();
        }

        IamCenterClient.EvaluateRequest request = IamCenterClient.EvaluateRequest.builder()
                .userId(userId)
                .namespace(namespace)
                .action(action)
                .categoryId(categoryId)
                .resourceId(resourceId)
                .build();

        try {
            IamCenterClient.EvaluateResponse response = iamCenterClient.evaluate(request, correlationId, userToken);
            return PermissionDecision.builder()
                    .allowed(response.isAllowed())
                    .reasonCode(response.isAllowed() ? DecisionReason.ALLOWED_BY_REMOTE_IAM
                            : DecisionReason.DENIED_BY_REMOTE_IAM)
                    .matchedPolicy(response.getMatchedPolicy())
                    .matchedRole(response.getMatchedRole())
                    .source("REMOTE_IAM")
                    .namespace(namespace)
                    .action(action)
                    .categoryId(categoryId)
                    .resourceId(resourceId)
                    .build();
        } catch (Exception e) {
            log.error("Error evaluating permission via remote IAM", e);
            return PermissionDecision.builder()
                    .allowed(false)
                    .reasonCode(DecisionReason.ERROR_REMOTE_IAM)
                    .source("REMOTE_IAM")
                    .namespace(namespace)
                    .action(action)
                    .categoryId(categoryId)
                    .build();
        }
    }

    @Override
    public String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getSubject();
        }
        return "anonymous";
    }

    @Override
    public String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getClaimAsString("email");
        }
        return "anonymous";
    }
}
