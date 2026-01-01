package com.aitech.rbac.service;

import com.aitech.rbac.dto.PolicyDocument;
import com.aitech.rbac.model.Registry;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PolicyEngine {

    private final RegistryService registryService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PolicyEngine(RegistryService registryService) {
        this.registryService = registryService;
    }

    public String matrixToPolicyDocument(Map<String, Map<String, Boolean>> matrix, String policyName, String policyId)
            throws JsonProcessingException {
        Registry registry = registryService.getRegistry();
        PolicyDocument doc = new PolicyDocument();
        doc.setVersion("2026-01-01");
        doc.setId(policyId);
        doc.setName(policyName);

        List<PolicyDocument.Statement> statements = new ArrayList<>();

        for (Map.Entry<String, Map<String, Boolean>> entry : matrix.entrySet()) {
            String nsKey = entry.getKey();
            Map<String, Boolean> actionsMap = entry.getValue();
            Registry.NamespaceDef nsDef = registry.getNamespaces().get(nsKey);

            if (nsDef == null)
                continue;

            List<String> activeActions = actionsMap.entrySet().stream()
                    .filter(Map.Entry::getValue)
                    .map(Map.Entry::getKey)
                    .sorted()
                    .collect(Collectors.toList());

            if (activeActions.isEmpty())
                continue;

            // Wildcard Check
            boolean isFullAccess = registry.getWildcardPolicy().isAllowNamespaceWildcard() &&
                    nsDef.getSupportedActions().stream().allMatch(activeActions::contains);

            List<String> finalActions = new ArrayList<>();
            if (isFullAccess) {
                finalActions.add(nsKey + ":*");
            } else {
                activeActions.forEach(a -> finalActions.add(nsKey + ":" + a));
            }

            PolicyDocument.Statement stmt = new PolicyDocument.Statement();
            stmt.setSid("Allow" + capitalize(nsKey) + "Access");
            stmt.setEffect("Allow");
            stmt.setAction(finalActions);
            stmt.setResource(Collections.singletonList("namespace/" + nsKey + "/*")); // Default resource scope

            statements.add(stmt);
        }

        doc.setStatement(statements);
        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(doc);
    }

    public Map<String, Map<String, Boolean>> policyDocumentToMatrix(String json) throws JsonProcessingException {
        Registry registry = registryService.getRegistry();
        PolicyDocument doc = objectMapper.readValue(json, PolicyDocument.class);

        Map<String, Map<String, Boolean>> matrix = new HashMap<>();

        // Initialize false
        registry.getNamespaces().forEach((key, def) -> {
            Map<String, Boolean> actionMap = new HashMap<>();
            def.getSupportedActions().forEach(a -> actionMap.put(a, false));
            matrix.put(key, actionMap);
        });

        if (doc.getStatement() == null)
            return matrix;

        // Process Allows
        doc.getStatement().stream().filter(s -> "Allow".equalsIgnoreCase(s.getEffect()))
                .forEach(stmt -> applyActions(stmt, matrix, registry, true));

        // Process Denies
        doc.getStatement().stream().filter(s -> "Deny".equalsIgnoreCase(s.getEffect()))
                .forEach(stmt -> applyActions(stmt, matrix, registry, false));

        return matrix;
    }

    private void applyActions(PolicyDocument.Statement stmt, Map<String, Map<String, Boolean>> matrix,
            Registry registry, boolean value) {
        List<String> actions = stmt.getAction();
        if (actions == null)
            return;

        for (String actionStr : actions) {
            String[] parts = actionStr.split(":");
            if (parts.length != 2)
                continue; // Ignore malformed or "*" (unless handled)

            String ns = parts[0];
            String act = parts[1];

            if (ns.equals("*")) {
                // Global Wildcard logic if enabled? Assuming specific namespace expansion for
                // now
                if (registry.getWildcardPolicy().isAllowGlobalWildcard()) {
                    matrix.values().forEach(m -> m.replaceAll((k, v) -> value));
                }
                continue;
            }

            if (!matrix.containsKey(ns))
                continue;
            Registry.NamespaceDef nsDef = registry.getNamespaces().get(ns);

            if (act.equals("*")) {
                if (registry.getWildcardPolicy().isAllowNamespaceWildcard()) {
                    nsDef.getSupportedActions().forEach(a -> matrix.get(ns).put(a, value));
                }
            } else {
                if (matrix.get(ns).containsKey(act)) {
                    matrix.get(ns).put(act, value);
                }
            }
        }
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty())
            return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
