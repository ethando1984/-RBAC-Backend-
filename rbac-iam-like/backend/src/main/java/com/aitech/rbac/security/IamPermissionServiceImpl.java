package com.aitech.rbac.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@lombok.extern.slf4j.Slf4j
@Service("iamPermissionService")
@Primary
@RequiredArgsConstructor
public class IamPermissionServiceImpl implements PermissionService {

    private final IamCenterClient iamCenterClient;

    @Override
    public boolean can(String namespace, String action) {
        return evaluate(namespace, action, null, null).isAllowed();
    }

    @Override
    public boolean can(String permission) {
        if (permission == null)
            return false;
        String[] parts = permission.split(":");
        if (parts.length != 2)
            return false;
        return can(parts[0], parts[1]);
    }

    @Override
    public boolean canInCategory(UUID categoryId, String namespace, String action) {
        return evaluate(namespace, action, categoryId, null).isAllowed();
    }

    @Override
    public PermissionDecision evaluate(String namespace, String action, UUID categoryId, String resourceId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            PermissionDecision localDecision = evaluateViaJwt(jwt, namespace, action, categoryId);

            if (localDecision != null) {
                localDecision.setResourceId(resourceId);
                return localDecision;
            }
        }

        // Fallback to remote IAM
        return evaluateViaRemote(authentication, namespace, action, categoryId, resourceId);
    }

    private PermissionDecision evaluateViaJwt(Jwt jwt, String namespace, String action, UUID categoryId) {
        List<String> globalPermissions = jwt.getClaimAsStringList("permissions");
        List<Map<String, Object>> categoryScopes = jwt.getClaim("categoryScopes");

        // 1. Check Category Scopes for Explicit Deny (Overrides everything for this
        // category)
        if (categoryId != null && categoryScopes != null) {
            for (Map<String, Object> scope : categoryScopes) {
                String scopeCatId = (String) scope.get("categoryId");
                if (scopeCatId != null && scopeCatId.equals(categoryId.toString())) {
                    List<String> denied = (List<String>) scope.get("deny");
                    if (denied != null) {
                        for (String p : denied) {
                            if (p.equals(namespace + ":" + action) || p.equals(namespace + ":*") || p.equals("*:*")) {
                                return PermissionDecision.builder()
                                        .allowed(false)
                                        .reasonCode(DecisionReason.DENIED_CATEGORY_SCOPE)
                                        .source("JWT")
                                        .namespace(namespace)
                                        .action(action)
                                        .categoryId(categoryId)
                                        .build();
                            }
                        }
                    }
                }
            }
        }

        // 2. Check Category Scopes for Allow (Priority over global if specific allow
        // exists)
        if (categoryId != null && categoryScopes != null) {
            for (Map<String, Object> scope : categoryScopes) {
                String scopeCatId = (String) scope.get("categoryId");
                if (scopeCatId != null && scopeCatId.equals(categoryId.toString())) {
                    List<String> allowed = (List<String>) scope.get("allow");
                    if (allowed != null) {
                        for (String p : allowed) {
                            if (matches(p, namespace, action)) {
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
            }
        }

        // 3. Check Global Permissions
        if (globalPermissions != null) {
            for (String p : globalPermissions) {
                if (matches(p, namespace, action)) {
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

        // If we have a JWT but no match found, and we want to fall through to remote,
        // we return null.
        // Or if we consider JWT authoritative for what it contains, we might return
        // DENIED_BY_DEFAULT.
        // Requirement says: "Remote IAM evaluate fallback (for missing claims or
        // category-scoped evaluation)"
        // This implies if not found in JWT, try remote.
        return null;
    }

    private PermissionDecision evaluateViaRemote(Authentication authentication, String namespace, String action,
            UUID categoryId, String resourceId) {
        String userId = getCurrentUserId();
        String userToken = null;
        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            userToken = jwtToken.getToken().getTokenValue();
        }

        IamCenterClient.EvaluateRequest request = IamCenterClient.EvaluateRequest.builder()
                .userId(userId)
                .namespace(namespace)
                .action(action)
                .categoryId(categoryId)
                .resourceId(resourceId)
                .build();

        try {
            IamCenterClient.EvaluateResponse response = iamCenterClient.evaluate(request, UUID.randomUUID().toString(),
                    userToken);

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
            log.error("Remote evaluation failed", e);
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

    private boolean matches(String permission, String namespace, String action) {
        if (permission.equals("*:*"))
            return true;
        if (permission.equals(namespace + ":*"))
            return true;
        if (permission.equals(namespace + ":" + action))
            return true;
        return false;
    }

    @Override
    public String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null)
            return "system";
        if (auth instanceof JwtAuthenticationToken jwt) {
            return jwt.getToken().getSubject();
        }
        return auth.getName();
    }

    @Override
    public String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwt) {
            return (String) jwt.getToken().getClaims().get("email");
        }
        return null;
    }
}
