package com.aitech.rbac.service.impl;

import com.aitech.rbac.dto.PageResponse;
import com.aitech.rbac.mapper.PolicyMapper;
import com.aitech.rbac.mapper.PolicyVersionMapper;
import com.aitech.rbac.model.PolicyVersion;
import com.aitech.rbac.service.AuditService;
import com.aitech.rbac.service.PolicyEngine;
import com.aitech.rbac.service.PolicyService;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PolicyServiceImpl implements PolicyService {

    private final PolicyMapper policyMapper;
    private final PolicyVersionMapper versionMapper;
    private final PolicyEngine policyEngine;
    private final AuditService auditService;
    private final com.aitech.rbac.service.ResourceAccessService resourceAccessService;
    private final com.aitech.rbac.mapper.NamespaceMapper namespaceMapper;
    private final com.aitech.rbac.mapper.ActionTypeMapper actionTypeMapper;

    public PolicyServiceImpl(PolicyMapper policyMapper, PolicyVersionMapper versionMapper,
            PolicyEngine policyEngine, AuditService auditService,
            com.aitech.rbac.service.ResourceAccessService resourceAccessService,
            com.aitech.rbac.mapper.NamespaceMapper namespaceMapper,
            com.aitech.rbac.mapper.ActionTypeMapper actionTypeMapper) {
        this.policyMapper = policyMapper;
        this.versionMapper = versionMapper;
        this.policyEngine = policyEngine;
        this.auditService = auditService;
        this.resourceAccessService = resourceAccessService;
        this.namespaceMapper = namespaceMapper;
        this.actionTypeMapper = actionTypeMapper;
    }

    @Override
    public PageResponse<com.aitech.rbac.model.Permission> search(String usage, String domain, String search, int page,
            int size) {
        PageHelper.startPage(page, size);
        List<com.aitech.rbac.model.Permission> list = policyMapper.searchPolicies(usage, domain, search);
        PageInfo<com.aitech.rbac.model.Permission> pageInfo = new PageInfo<>(list);
        return new PageResponse<>(list, pageInfo.getTotal(), pageInfo.getPageNum(), pageInfo.getPageSize());
    }

    @Override
    public Map<String, Object> getImpact(UUID permissionId) {
        Map<String, Object> map = new HashMap<>();
        map.put("boundRolesCount", policyMapper.countBoundRoles(permissionId));
        map.put("affectedUsersCount", policyMapper.countAffectedUsers(permissionId));
        return map;
    }

    @Override
    @Transactional
    public void seal(UUID permissionId, Map<String, Map<String, Boolean>> matrix, boolean confirmImpact) {
        Integer boundRoles = policyMapper.countBoundRoles(permissionId);

        if (boundRoles > 0 && !confirmImpact) {
            throw new IllegalArgumentException(
                    "Policy is bound to " + boundRoles + " roles. Explicit confirmation required.");
        }

        String permissionName = policyMapper.getPermissionName(permissionId);

        try {
            // Convert Matrix to JSON
            String json = policyEngine.matrixToPolicyDocument(matrix, permissionName, permissionId.toString());

            // Sync resource_access table with matrix
            syncResourceAccess(permissionId, matrix);

            // Handle Versioning
            versionMapper.clearDefaults(permissionId);

            Integer maxVersion = versionMapper.getMaxVersionNumber(permissionId);
            int nextVersion = (maxVersion == null ? 0 : maxVersion) + 1;

            PolicyVersion pv = new PolicyVersion();
            pv.setVersionId(UUID.randomUUID());
            pv.setPermissionId(permissionId);
            pv.setVersionNumber(nextVersion);
            pv.setIsDefault(true);
            pv.setDocumentJson(json);
            pv.setCreatedAt(LocalDateTime.now());
            pv.setCreatedBy("ADMIN"); // Sould be current user via SecurityContext

            versionMapper.insert(pv);

            // Audit
            Integer affectedUsers = policyMapper.countAffectedUsers(permissionId);
            auditService.logAction("POLICY_SEAL_SCOPE", "POLICY", permissionId.toString(),
                    null, json, boundRoles, affectedUsers);

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to generate policy document", e);
        }
    }

    private void syncResourceAccess(UUID permissionId, Map<String, Map<String, Boolean>> matrix) {
        // Get current resource access entries for this permission
        List<com.aitech.rbac.model.ResourceAccess> currentAccess = resourceAccessService
                .getByPermissionId(permissionId);

        // Delete all current entries
        for (com.aitech.rbac.model.ResourceAccess ra : currentAccess) {
            resourceAccessService.delete(ra);
        }

        // Create new entries based on matrix
        List<com.aitech.rbac.model.Namespace> namespaces = namespaceMapper.findAll();
        List<com.aitech.rbac.model.ActionType> actionTypes = actionTypeMapper.findAll();

        for (Map.Entry<String, Map<String, Boolean>> nsEntry : matrix.entrySet()) {
            String nsKey = nsEntry.getKey();
            Map<String, Boolean> actions = nsEntry.getValue();

            // Find namespace ID
            UUID namespaceId = namespaces.stream()
                    .filter(ns -> ns.getNamespaceKey().equals(nsKey))
                    .findFirst()
                    .map(ns -> ns.getNamespaceId())
                    .orElse(null);

            if (namespaceId == null)
                continue;

            for (Map.Entry<String, Boolean> actionEntry : actions.entrySet()) {
                String actionKey = actionEntry.getKey();
                Boolean isEnabled = actionEntry.getValue();

                if (!isEnabled)
                    continue;

                // Find action type ID
                UUID actionTypeId = actionTypes.stream()
                        .filter(at -> at.getActionKey().equals(actionKey))
                        .findFirst()
                        .map(at -> at.getActionTypeId())
                        .orElse(null);

                if (actionTypeId == null)
                    continue;

                // Create resource access entry
                com.aitech.rbac.model.ResourceAccess ra = new com.aitech.rbac.model.ResourceAccess();
                ra.setPermissionId(permissionId);
                ra.setNamespaceId(namespaceId);
                ra.setActionTypeId(actionTypeId);
                resourceAccessService.create(ra);
            }
        }
    }

    @Override
    public List<PolicyVersion> getVersions(UUID permissionId) {
        return versionMapper.findByPermissionId(permissionId);
    }

    @Override
    @Transactional
    public void rollback(UUID permissionId, UUID versionId) {
        PolicyVersion target = versionMapper.findById(versionId);
        if (target == null || !target.getPermissionId().equals(permissionId)) {
            throw new IllegalArgumentException("Version not found or does not belong to policy");
        }

        versionMapper.clearDefaults(permissionId);
        versionMapper.setAsDefault(versionId);

        // Audit
        Integer boundRoles = policyMapper.countBoundRoles(permissionId);
        Integer affectedUsers = policyMapper.countAffectedUsers(permissionId);
        auditService.logAction("POLICY_ROLLBACK", "POLICY", permissionId.toString(),
                "VersionId:" + versionMapper.findDefaultByPermissionId(permissionId).getVersionId(),
                "VersionId:" + versionId, boundRoles, affectedUsers);
    }
}
