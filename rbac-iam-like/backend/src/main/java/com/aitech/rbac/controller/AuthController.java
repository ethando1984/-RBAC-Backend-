package com.aitech.rbac.controller;

import com.aitech.rbac.dto.AuthResponse;
import com.aitech.rbac.dto.LoginRequest;
import com.aitech.rbac.service.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final com.aitech.rbac.service.UserService userService;
    private final com.aitech.rbac.service.UserAccessService userAccessService;

    public AuthController(AuthenticationManager authenticationManager,
            UserDetailsService userDetailsService,
            JwtService jwtService,
            com.aitech.rbac.service.UserService userService,
            com.aitech.rbac.service.UserAccessService userAccessService) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.userService = userService;
        this.userAccessService = userAccessService;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        var userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        var user = userService.findByUsername(request.getUsername());
        var accessList = userAccessService.getUserAccess(user.getUserId());

        java.util.Map<String, Object> extraClaims = new java.util.HashMap<>();
        if (!accessList.isEmpty()) {
            var access = accessList.get(0);
            java.util.List<String> roles = access.getRoles().stream()
                    .map(com.aitech.rbac.dto.UserAccessDTO.RoleDTO::getRoleName)
                    .toList();
            java.util.List<String> permissions = access.getRoles().stream()
                    .flatMap(r -> r.getPermissions().stream())
                    .map(p -> p.getNamespaceKey() + ":" + p.getActionKey())
                    .distinct()
                    .toList();

            extraClaims.put("roles", roles);
            extraClaims.put("permissions", permissions);
            extraClaims.put("email", user.getEmail());
        }

        String token = jwtService.generateToken(extraClaims, userDetails);
        return new AuthResponse(token);
    }

    @org.springframework.web.bind.annotation.GetMapping("/me")
    public com.aitech.rbac.dto.UserDTO getCurrentUser(
            org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        var user = userService.findByUsername(authentication.getName());
        if (user == null) {
            return null;
        }
        com.aitech.rbac.dto.UserDTO dto = new com.aitech.rbac.dto.UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setActive(user.isActive());
        dto.setPreferences(user.getPreferencesJson());
        return dto;
    }

    @org.springframework.web.bind.annotation.PutMapping("/profile")
    public void updateProfile(
            org.springframework.security.core.Authentication authentication,
            @RequestBody com.aitech.rbac.dto.ProfileUpdateDTO dto) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthorized");
        }
        var user = userService.findByUsername(authentication.getName());
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        userService.updateProfile(user.getUserId(), dto);
    }
}
