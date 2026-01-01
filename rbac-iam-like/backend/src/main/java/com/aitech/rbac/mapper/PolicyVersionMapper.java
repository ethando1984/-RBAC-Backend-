package com.aitech.rbac.mapper;

import com.aitech.rbac.model.PolicyVersion;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface PolicyVersionMapper {
        @Insert("INSERT INTO policy_versions (version_id, permission_id, version_number, is_default, document_json, created_at, created_by) "
                        +
                        "VALUES (#{versionId}, #{permissionId}, #{versionNumber}, #{isDefault}, #{documentJson}, #{createdAt}, #{createdBy})")
        void insert(PolicyVersion version);

        @Select("SELECT * FROM policy_versions WHERE permission_id = #{permissionId} ORDER BY version_number DESC")
        @Results({
                        @Result(property = "versionId", column = "version_id"),
                        @Result(property = "permissionId", column = "permission_id"),
                        @Result(property = "versionNumber", column = "version_number"),
                        @Result(property = "isDefault", column = "is_default"),
                        @Result(property = "documentJson", column = "document_json"),
                        @Result(property = "createdAt", column = "created_at"),
                        @Result(property = "createdBy", column = "created_by")
        })
        List<PolicyVersion> findByPermissionId(UUID permissionId);

        @Select("SELECT * FROM policy_versions WHERE version_id = #{versionId}")

        @Results({
                        @Result(property = "versionId", column = "version_id"),
                        @Result(property = "permissionId", column = "permission_id"),
                        @Result(property = "versionNumber", column = "version_number"),
                        @Result(property = "isDefault", column = "is_default"),
                        @Result(property = "documentJson", column = "document_json"),
                        @Result(property = "createdAt", column = "created_at"),
                        @Result(property = "createdBy", column = "created_by")
        })
        PolicyVersion findById(UUID versionId);

        @Select("SELECT * FROM policy_versions WHERE permission_id = #{permissionId} AND is_default = TRUE LIMIT 1")
        @Results({
                        @Result(property = "versionId", column = "version_id"),
                        @Result(property = "permissionId", column = "permission_id"),
                        @Result(property = "versionNumber", column = "version_number"),
                        @Result(property = "isDefault", column = "is_default"),
                        @Result(property = "documentJson", column = "document_json"),
                        @Result(property = "createdAt", column = "created_at"),
                        @Result(property = "createdBy", column = "created_by")
        })
        PolicyVersion findDefaultByPermissionId(UUID permissionId);

        @Update("UPDATE policy_versions SET is_default = FALSE WHERE permission_id = #{permissionId}")
        void clearDefaults(UUID permissionId);

        @Update("UPDATE policy_versions SET is_default = TRUE WHERE version_id = #{versionId}")
        void setAsDefault(UUID versionId);

        @Select("SELECT MAX(version_number) FROM policy_versions WHERE permission_id = #{permissionId}")
        Integer getMaxVersionNumber(UUID permissionId);
}
