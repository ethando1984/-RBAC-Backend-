package com.aitech.rbac.model;

import lombok.Data;
import java.util.*;
import java.time.LocalDateTime;

@Data
public class Role {
    private UUID roleId;
    private String roleName;
    private String description;
    private boolean isSystemRole;
}
