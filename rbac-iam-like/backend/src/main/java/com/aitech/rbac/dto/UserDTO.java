package com.aitech.rbac.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UserDTO {
    private UUID userId;
    private String username;
    private String email;
    private boolean active;
    private String preferences;
}
