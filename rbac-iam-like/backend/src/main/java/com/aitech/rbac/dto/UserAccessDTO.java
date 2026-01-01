package com.aitech.rbac.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class UserAccessDTO {
    private UUID userId;
    private String username;
    private List<RoleDTO> roles;

    @Data
    public static class RoleDTO {
        private UUID roleId;
        private String roleName;
        private List<PermissionDTO> permissions;
    }

    @Data
    public static class PermissionDTO {
        private UUID permissionId;
        private String permissionName;
        private String namespaceKey;
        private String actionKey;
    }
}
