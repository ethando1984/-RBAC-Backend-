package com.aitech.rbac.mapper;

import com.aitech.rbac.model.PolicyVersion;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface PolicyVersionMapper {
        void insert(PolicyVersion version);

        List<PolicyVersion> findByPermissionId(UUID permissionId);

        PolicyVersion findById(UUID versionId);

        PolicyVersion findDefaultByPermissionId(UUID permissionId);

        void clearDefaults(UUID permissionId);

        void setAsDefault(UUID versionId);

        Integer getMaxVersionNumber(UUID permissionId);
}
