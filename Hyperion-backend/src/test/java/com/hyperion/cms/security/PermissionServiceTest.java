package com.hyperion.cms.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PermissionServiceTest {

    @Test
    void can_ReturnsTrue_WhenPermissionInClaims() {
        PermissionService service = new PermissionService();
        setupMockSecurityContext(List.of("articles:read"));

        assertTrue(service.can("articles", "read"));
        assertFalse(service.can("articles", "write"));
    }

    @Test
    void canInCategory_ReturnsTrue_WhenScopedAllow() {
        PermissionService service = new PermissionService();
        UUID catId = UUID.randomUUID();

        // Mock categoryScopes claim
        List<Map<String, Object>> scopes = List.of(
                Map.of(
                        "categoryId", catId.toString(),
                        "allow", List.of("articles:publish")));

        setupMockSecurityContextWithScopes(scopes);

        // Global check fails (no global perm)
        assertFalse(service.can("articles", "publish"));

        // Category check succeeds
        assertTrue(service.canInCategory(catId, "articles", "publish"));

        // Wrong category fails
        assertFalse(service.canInCategory(UUID.randomUUID(), "articles", "publish"));
    }

    private void setupMockSecurityContext(List<String> permissions) {
        Jwt jwt = createJwt(Map.of("permissions", permissions));

        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(new JwtAuthenticationToken(jwt));
        SecurityContextHolder.setContext(context);
    }

    private void setupMockSecurityContextWithScopes(List<Map<String, Object>> scopes) {
        Jwt jwt = createJwt(Map.of("categoryScopes", scopes));

        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(new JwtAuthenticationToken(jwt));
        SecurityContextHolder.setContext(context);
    }

    private Jwt createJwt(Map<String, Object> claims) {
        return new Jwt(
                "token",
                java.time.Instant.now(),
                java.time.Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                claims);
    }
}
