package com.aitech.rbac.model;

import lombok.Data;
import java.util.*;
import java.time.LocalDateTime;

@Data
public class Permission {
    private UUID permissionId;
    private String permissionName;
    private String permissionKey;
    private String description;
    private int resourceAccessCount;
    private int attachedRoleCount;
}
