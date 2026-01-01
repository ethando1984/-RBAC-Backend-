package com.aitech.rbac.model.policy;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

/**
 * Individual statement within a policy document
 */
@Data
public class PolicyStatement {
    @JsonProperty("Sid")
    private String sid;

    @JsonProperty("Effect")
    private Effect effect = Effect.Allow;

    @JsonProperty("Action")
    private List<String> action;

    @JsonProperty("NotAction")
    private List<String> notAction;

    @JsonProperty("Resource")
    private List<String> resource;

    @JsonProperty("NotResource")
    private List<String> notResource;

    @JsonProperty("Condition")
    private Map<String, Map<String, Object>> condition;

    public enum Effect {
        Allow,
        Deny
    }
}
