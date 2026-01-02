package com.aitech.rbac.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NamespaceDTO {
    private String namespaceKey;
    private String description;
}
