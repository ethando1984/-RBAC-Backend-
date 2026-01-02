package com.hyperion.cms.controller;

import com.hyperion.cms.security.PermissionService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "bearer-key")
public class AuthController {

    private final PermissionService permissionService;

    public AuthController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping("/whoami")
    public Map<String, Object> whoami() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwt) {
            return Map.of(
                    "principal", jwt.getName(),
                    "claims", jwt.getToken().getClaims());
        }
        return Map.of("error", "Not authenticated with JWT");
    }
}
