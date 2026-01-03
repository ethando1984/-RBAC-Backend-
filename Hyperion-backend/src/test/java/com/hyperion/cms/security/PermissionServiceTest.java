package com.hyperion.cms.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PermissionServiceTest {

    @Mock
    private IamCenterClient iamCenterClient;

    @Mock
    private SecurityContext securityContext;

    private PermissionServiceImpl permissionService;

    @BeforeEach
    void setUp() {
        permissionService = new PermissionServiceImpl(iamCenterClient);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void can_ReturnsTrue_WhenExactPermissionInJwt() {
        setupMockJwt(Map.of("permissions", List.of("articles:read")), "user-1");

        assertTrue(permissionService.can("articles", "read"));
        PermissionDecision decision = permissionService.evaluate("articles", "read", null, null);
        assertTrue(decision.isAllowed());
        assertEquals(DecisionReason.ALLOWED_BY_JWT, decision.getReasonCode());
    }

    @Test
    void can_ReturnsTrue_WhenWildcardInJwt() {
        setupMockJwt(Map.of("permissions", List.of("articles:*")), "user-1");

        assertTrue(permissionService.can("articles", "publish"));
        assertTrue(permissionService.can("articles", "delete"));
    }

    @Test
    void can_ReturnsTrue_WhenGlobalWildcardInJwt() {
        setupMockJwt(Map.of("permissions", List.of("*:*")), "user-1");

        assertTrue(permissionService.can("iam", "admin"));
        assertTrue(permissionService.can("orders", "write"));
    }

    @Test
    void can_ReturnsFalse_WhenNoMatchInJwtAndNoRemote() {
        setupMockJwt(Map.of("permissions", List.of("articles:read")), "user-1");

        IamCenterClient.EvaluateResponse response = new IamCenterClient.EvaluateResponse();
        response.setAllowed(false);
        when(iamCenterClient.evaluate(any(), any(), any())).thenReturn(response);

        assertFalse(permissionService.can("articles", "write"));
    }

    @Test
    void canInCategory_ReturnsTrue_WhenCategoryScopedAllowInJwt() {
        UUID catId = UUID.randomUUID();
        Map<String, Object> scope = Map.of(
                "categoryId", catId.toString(),
                "allow", List.of("articles:publish"));
        setupMockJwt(Map.of("categoryScopes", List.of(scope)), "user-1");

        assertTrue(permissionService.canInCategory(catId, "articles", "publish"));
    }

    @Test
    void canInCategory_ReturnsFalse_WhenCategoryScopedExplicitDenyInJwt() {
        UUID catId = UUID.randomUUID();
        setupMockJwt(Map.of(
                "permissions", List.of("articles:*"),
                "categoryScopes", List.of(Map.of(
                        "categoryId", catId.toString(),
                        "deny", List.of("articles:delete")))),
                "user-1");

        assertFalse(permissionService.canInCategory(catId, "articles", "delete"));
        assertTrue(permissionService.canInCategory(catId, "articles", "write"));
    }

    @Test
    void evaluate_ReturnsRemoteIamDecision_WhenJwtMissing() {
        setupMockJwt(Map.of("permissions", Collections.emptyList()), "user-1");

        IamCenterClient.EvaluateResponse remoteResponse = new IamCenterClient.EvaluateResponse();
        remoteResponse.setAllowed(true);
        remoteResponse.setMatchedPolicy("Policy-123");
        when(iamCenterClient.evaluate(any(), any(), any())).thenReturn(remoteResponse);

        PermissionDecision decision = permissionService.evaluate("articles", "write", null, null);

        assertTrue(decision.isAllowed());
        assertEquals(DecisionReason.ALLOWED_BY_REMOTE_IAM, decision.getReasonCode());
        assertEquals("Policy-123", decision.getMatchedPolicy());
    }

    @Test
    void evaluate_ReturnsDeniedByRemote_WhenRemoteIamDenies() {
        setupMockJwt(Map.of("permissions", Collections.emptyList()), "user-1");

        IamCenterClient.EvaluateResponse remoteResponse = new IamCenterClient.EvaluateResponse();
        remoteResponse.setAllowed(false);
        remoteResponse.setReason("DENIED_BY_POLICY");
        when(iamCenterClient.evaluate(any(), any(), any())).thenReturn(remoteResponse);

        PermissionDecision decision = permissionService.evaluate("articles", "write", null, null);

        assertFalse(decision.isAllowed());
        assertEquals(DecisionReason.DENIED_BY_REMOTE_IAM, decision.getReasonCode());
    }

    @Test
    void can_RejectInvalidPermissionFormat() {
        assertFalse(permissionService.can("invalidFormat"));
        assertFalse(permissionService.can(null));
    }

    @Test
    void evaluate_ReturnsErrorRemoteIam_WhenRemoteCallFails() {
        setupMockJwt(Map.of("permissions", Collections.emptyList()), "user-1");

        when(iamCenterClient.evaluate(any(), any(), any())).thenThrow(new RuntimeException("API Down"));

        PermissionDecision decision = permissionService.evaluate("articles", "write", null, null);

        assertFalse(decision.isAllowed());
        assertEquals(DecisionReason.ERROR_REMOTE_IAM, decision.getReasonCode());
    }

    private void setupMockJwt(Map<String, Object> claims, String subject) {
        Jwt jwt = new Jwt("token", java.time.Instant.now(), java.time.Instant.now().plusSeconds(3600),
                Map.of("alg", "none"), claims);
        JwtAuthenticationToken auth = new JwtAuthenticationToken(jwt);
        when(securityContext.getAuthentication()).thenReturn(auth);
    }
}
