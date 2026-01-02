package com.aitech.rbac.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.*;
import java.time.LocalDateTime;

@Data
public class User {
    private UUID userId;
    private String username;
    private String email;

    @JsonProperty("password")
    private String passwordHash;

    @JsonProperty("active")
    private boolean isActive;
    private String preferencesJson;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Role> roles;
}
