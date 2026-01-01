package com.aitech.rbac.dto;

import lombok.Data;
import java.util.List;

@Data
public class PolicyDocument {
    private String Version; // "2026-01-01"
    private String Id;
    private String Name;
    private List<Statement> Statement;

    @Data
    public static class Statement {
        private String Sid;
        private String Effect; // "Allow" | "Deny"
        private List<String> Action;
        private List<String> Resource;
        // Condition map if needed
    }
}
