package com.aitech.rbac.model;

import lombok.Data;
import java.util.*;
import java.time.LocalDateTime;

@Data
public class UserRole {
    private UUID userId;
    private UUID roleId;
}
