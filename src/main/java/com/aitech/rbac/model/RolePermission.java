package com.aitech.rbac.model;

import lombok.Data;
import java.util.*;
import java.time.LocalDateTime;

@Data
public class RolePermission {
    private UUID roleId;
    private UUID permissionId;
}
