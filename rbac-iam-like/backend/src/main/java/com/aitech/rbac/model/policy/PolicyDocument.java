package com.aitech.rbac.model.policy;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

/**
 * AWS IAM-style Policy Document
 */
@Data
public class PolicyDocument {
    @JsonProperty("Version")
    private String version = "2026-01-01";

    @JsonProperty("Id")
    private String id;

    @JsonProperty("Name")
    private String name;

    @JsonProperty("Description")
    private String description;

    @JsonProperty("Statement")
    private List<PolicyStatement> statement;

    @JsonProperty("Meta")
    private Map<String, Object> meta;
}
