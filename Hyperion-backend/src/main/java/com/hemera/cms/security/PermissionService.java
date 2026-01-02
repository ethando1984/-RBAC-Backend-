package com.hemera.cms.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PermissionService {

    /**
     * Check if the current user has the global permission.
     * Looks for a claim "permissions" in the JWT which is a List of Strings
     * "namespace:action".
     */
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PermissionService.class);

    public boolean can(String namespace, String action) {
        String requiredPermission = "SCOPE_" + namespace + ":" + action;
        List<String> permissions = getCurrentUserPermissions();

        // Check for exact match or wildcards
        for (String p : permissions) {
            if (p.equals("SCOPE_*:*"))
                return true; // Global admin
            if (p.equals("SCOPE_" + namespace + ":*"))
                return true; // All actions in namespace
            if (p.equals("SCOPE_*:" + action))
                return true; // specific action in all namespaces
            if (p.equals(requiredPermission))
                return true; // Exact match
        }

        log.warn("Permission denied for user {}: required {}, but had {}",
                getCurrentUserEmail(), requiredPermission, permissions);
        return false;
    }

    /**
     * Check permissions with Category Scope.
     * 
     * Strategy:
     * 1. Check if user has global permission. If yes, ALLOW.
     * 2. Check "categoryScopes" claim in JWT.
     * Format: List<Map<String, Object>> where each map has "categoryId":String,
     * "allow":List<String>, "deny":List<String>
     * 3. Fallback to IAM Center remote call (Simulated here with a deny-by-default
     * for MVP if not in token).
     */
    @SuppressWarnings("unchecked")
    public boolean canInCategory(UUID categoryId, String namespace, String action) {
        if (can(namespace, action)) {
            return true; // Global permission overrides
        }

        String requiredPermissionRaw = namespace + ":" + action;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            Map<String, Object> claims = jwtToken.getToken().getClaims();

            // Check categoryScopes
            if (claims.containsKey("categoryScopes")) {
                List<Map<String, Object>> scopes = (List<Map<String, Object>>) claims.get("categoryScopes");
                for (Map<String, Object> scope : scopes) {
                    String scopeCatId = (String) scope.get("categoryId");
                    if (scopeCatId != null && scopeCatId.equals(categoryId.toString())) {

                        // Check explicit deny first
                        List<String> denied = (List<String>) scope.get("deny");
                        if (denied != null && denied.contains(requiredPermissionRaw)) {
                            return false;
                        }

                        // Check allow
                        List<String> allowed = (List<String>) scope.get("allow");
                        if (allowed != null && allowed.contains(requiredPermissionRaw)) {
                            return true;
                        }
                    }
                }
            }
        }

        // TODO: Implement Remote IAM Call + Redis Cache Fallback here
        return false;
    }

    private List<String> getCurrentUserPermissions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null)
            return List.of();
        return authentication.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .toList();
    }

    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            return jwtToken.getToken().getSubject();
        }
        return "system";
    }

    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            Map<String, Object> claims = jwtToken.getToken().getClaims();
            return (String) claims.get("email");
        }
        return "system@hemera.com";
    }
}
