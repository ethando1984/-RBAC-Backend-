package com.aitech.rbac.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActionTypeDTO {
    private String actionKey;
    private String description;
}
