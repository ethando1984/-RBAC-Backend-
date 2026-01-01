package com.aitech.rbac.service;

import com.aitech.rbac.dto.PageResponse;
import com.aitech.rbac.model.PolicyVersion;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface PolicyService {
    PageResponse<com.aitech.rbac.model.Permission> search(String usage, String domain, String search, int page,
            int size);

    Map<String, Object> getImpact(UUID permissionId);

    void seal(UUID permissionId, Map<String, Map<String, Boolean>> matrix, boolean confirmImpact);

    List<PolicyVersion> getVersions(UUID permissionId);

    void rollback(UUID permissionId, UUID versionId);
}
