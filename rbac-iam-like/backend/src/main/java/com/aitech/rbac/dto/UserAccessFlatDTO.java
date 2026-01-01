package com.aitech.rbac.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UserAccessFlatDTO {
    private UUID userId;
    private String username;
    private UUID roleId;
    private String roleName;
    private UUID permissionId;
    private String permissionName;
    private String namespaceKey;
    private String actionKey;
}
