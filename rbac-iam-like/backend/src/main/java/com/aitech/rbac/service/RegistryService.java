package com.aitech.rbac.service;

import com.aitech.rbac.model.Registry;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RegistryService {
    private Registry registry;

    @PostConstruct
    public void init() {
        registry = new Registry();

        // Wildcard Policy
        Registry.WildcardPolicy wp = new Registry.WildcardPolicy();
        wp.setAllowNamespaceWildcard(true);
        wp.setAllowGlobalWildcard(false);
        registry.setWildcardPolicy(wp);

        // Namespaces
        Map<String, Registry.NamespaceDef> nsMap = new HashMap<>();

        nsMap.put("iam", createNs("iam", "Identity & Access Management",
                Arrays.asList("read", "write", "update", "delete", "admin")));

        nsMap.put("orders", createNs("orders", "Order Processing System",
                Arrays.asList("read", "create", "update", "delete", "approve")));

        nsMap.put("inventory", createNs("inventory", "Inventory Management",
                Arrays.asList("read", "stock_update", "audit")));

        nsMap.put("marketing", createNs("marketing", "Marketing Campaigns",
                Arrays.asList("read", "publish", "analytics")));

        registry.setNamespaces(nsMap);
    }

    private Registry.NamespaceDef createNs(String key, String label, List<String> actions) {
        Registry.NamespaceDef ns = new Registry.NamespaceDef();
        ns.setKey(key);
        ns.setLabel(label);
        ns.setSupportedActions(actions);
        return ns;
    }

    public Registry getRegistry() {
        return registry;
    }
}
