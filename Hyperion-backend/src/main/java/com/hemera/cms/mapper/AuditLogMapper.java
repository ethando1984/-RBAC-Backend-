package com.hemera.cms.mapper;

import com.hemera.cms.model.AuditLog;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface AuditLogMapper {

    @Select("<script>" +
            "SELECT * FROM audit_logs " +
            "<where>" +
            "<if test='actorUserId != null'>actor_user_id = #{actorUserId}</if> " +
            "<if test='entityType != null'>AND entity_type = #{entityType}</if> " +
            "<if test='entityId != null'>AND entity_id = #{entityId}</if> " +
            "</where>" +
            "ORDER BY created_at DESC " +
            "LIMIT #{size} OFFSET #{offset}" +
            "</script>")
    List<AuditLog> findAll(
            @Param("actorUserId") String actorUserId,
            @Param("entityType") String entityType,
            @Param("entityId") String entityId,
            @Param("offset") int offset,
            @Param("size") int size);

    @Select("SELECT * FROM audit_logs WHERE id = #{id}")
    AuditLog findById(UUID id);

    @Insert("INSERT INTO audit_logs (id, actor_user_id, actor_email, action_type, entity_type, entity_id, " +
            "old_value_json, new_value_json, created_at, ip_address, correlation_id) " +
            "VALUES (#{id}, #{actorUserId}, #{actorEmail}, #{actionType}, #{entityType}, #{entityId}, " +
            "#{oldValueJson}, #{newValueJson}, #{createdAt}, #{ipAddress}, #{correlationId})")
    void insert(AuditLog auditLog);

    @Select("SELECT COUNT(*) FROM audit_logs WHERE entity_type = #{entityType}")
    int countByEntityType(@Param("entityType") String entityType);
}
