package com.aitech.rbac.dto;

import lombok.Data;

@Data
public class ProfileUpdateDTO {
    private String email;
    private String currentPassword;
    private String newPassword;
    private String preferences;
}
