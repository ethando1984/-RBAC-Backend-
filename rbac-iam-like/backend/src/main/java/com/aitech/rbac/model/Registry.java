package com.aitech.rbac.model;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class Registry {
    private Map<String, NamespaceDef> namespaces;
    private WildcardPolicy wildcardPolicy;

    @Data
    public static class NamespaceDef {
        private String key;
        private String label;
        private List<String> supportedActions;
    }

    @Data
    public static class WildcardPolicy {
        private boolean allowNamespaceWildcard;
        private boolean allowGlobalWildcard;
    }
}
