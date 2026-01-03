package com.aitech.rbac.service.impl;

import com.aitech.rbac.dto.PageResponse;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.aitech.rbac.mapper.UserMapper;
import com.aitech.rbac.model.User;
import com.aitech.rbac.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class UserServiceImpl implements UserService {
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;

    private final com.aitech.rbac.security.PermissionService permissionService;
    private final com.aitech.rbac.service.UserAccessService userAccessService;

    public UserServiceImpl(UserMapper mapper, PasswordEncoder passwordEncoder,
            @org.springframework.beans.factory.annotation.Qualifier("iamPermissionService") com.aitech.rbac.security.PermissionService permissionService,
            com.aitech.rbac.service.UserAccessService userAccessService) {
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
        this.permissionService = permissionService;
        this.userAccessService = userAccessService;
    }

    public List<User> getAll() {
        return mapper.findAll(null);
    }

    public PageResponse<User> getAll(int page, int size, String search) {
        PageHelper.startPage(page, size);
        List<User> users = mapper.findAll(search);
        PageInfo<User> pageInfo = new PageInfo<>(users);
        return new PageResponse<>(users, pageInfo.getTotal(), page, size);
    }

    public User getById(UUID id) {
        return mapper.findById(id);
    }

    public User findByUsername(String username) {
        return mapper.findByUsername(username);
    }

    public void create(User entity) {
        if (entity.getUserId() == null) {
            entity.setUserId(java.util.UUID.randomUUID());
        }
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(java.time.LocalDateTime.now());
        }
        entity.setUpdatedAt(java.time.LocalDateTime.now());

        // Encode password if provided
        if (entity.getPasswordHash() != null && !entity.getPasswordHash().isEmpty()) {
            // Check if it's already encoded (bcrypt starts with $2a$, $2b$, or $2y$)
            if (!entity.getPasswordHash().startsWith("$2")) {
                entity.setPasswordHash(passwordEncoder.encode(entity.getPasswordHash()));
            }
        }

        mapper.insert(entity);
    }

    public void update(User entity) {
        // Privilege Check
        checkPrivilegeModification(entity.getUserId());

        entity.setUpdatedAt(java.time.LocalDateTime.now());

        // Handle password update: only encode if a new password is provided and it's
        // not already encoded
        if (entity.getPasswordHash() != null && !entity.getPasswordHash().isEmpty()) {
            if (!entity.getPasswordHash().startsWith("$2")) {
                entity.setPasswordHash(passwordEncoder.encode(entity.getPasswordHash()));
            }
        } else {
            // If no password provided, preserve the existing one
            User existing = mapper.findById(entity.getUserId());
            if (existing != null) {
                entity.setPasswordHash(existing.getPasswordHash());
            }
        }

        mapper.update(entity);
    }

    public void updateProfile(UUID userId, com.aitech.rbac.dto.ProfileUpdateDTO dto) {
        User user = mapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
            user.setEmail(dto.getEmail());
        }

        if (dto.getPreferences() != null) {
            user.setPreferencesJson(dto.getPreferences());
        }

        if (dto.getNewPassword() != null && !dto.getNewPassword().isEmpty()) {
            // Validate current password
            if (dto.getCurrentPassword() == null
                    || !passwordEncoder.matches(dto.getCurrentPassword(), user.getPasswordHash())) {
                throw new RuntimeException("Invalid current password");
            }
            user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        }

        user.setUpdatedAt(java.time.LocalDateTime.now());
        mapper.update(user);
    }

    public void delete(UUID id) {
        checkPrivilegeModification(id);
        mapper.delete(id);
    }

    private void checkPrivilegeModification(UUID targetUserId) {
        String currentUserIdStr = permissionService.getCurrentUserId();

        // Skip if system or unauthenticated (though robust systems should require auth)
        if (currentUserIdStr == null || "system".equals(currentUserIdStr) || "anonymousUser".equals(currentUserIdStr)) {
            return;
        }

        UUID currentUserId;
        try {
            currentUserId = UUID.fromString(currentUserIdStr);
        } catch (IllegalArgumentException e) {
            // Maybe a system token or invalid format
            return;
        }

        // Allow self-update
        if (targetUserId.equals(currentUserId)) {
            return;
        }

        // Check if target has Admin privileges
        if (hasAdminRole(targetUserId)) {
            // Ensure current user also has Admin privileges
            if (!hasAdminRole(currentUserId)) {
                throw new com.aitech.rbac.security.PermissionDeniedException(
                        com.aitech.rbac.security.PermissionDecision.builder()
                                .allowed(false)
                                .reasonCode(com.aitech.rbac.security.DecisionReason.DENIED_BY_DEFAULT)
                                .source("PRIVILEGE_CHECK")
                                .action("modify_admin")
                                .namespace("users")
                                .resourceId(targetUserId.toString())
                                .build());
            }
        }
    }

    private boolean hasAdminRole(UUID userId) {
        List<com.aitech.rbac.dto.UserAccessDTO> accessList = userAccessService.getUserAccess(userId);
        if (accessList == null || accessList.isEmpty())
            return false;

        // Check roles in the flattening
        for (com.aitech.rbac.dto.UserAccessDTO dto : accessList) {
            if (dto.getRoles() != null) {
                for (com.aitech.rbac.dto.UserAccessDTO.RoleDTO role : dto.getRoles()) {
                    if ("Admin".equalsIgnoreCase(role.getRoleName()) ||
                            "SuperAdmin".equalsIgnoreCase(role.getRoleName())) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
