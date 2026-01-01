package com.aitech.rbac.mapper;

import com.aitech.rbac.model.AuditLog;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface AuditLogMapper {
    @Insert("INSERT INTO audit_logs (log_id, actor_user_id, actor_email, action_type, entity_type, entity_id, " +
            "old_value_json, new_value_json, affected_roles_count, affected_users_count, created_at, ip_address) " +
            "VALUES (#{logId}, #{actorUserId}, #{actorEmail}, #{actionType}, #{entityType}, #{entityId}, " +
            "#{oldValueJson}, #{newValueJson}, #{affectedRolesCount}, #{affectedUsersCount}, #{createdAt}, #{ipAddress})")
    void insert(AuditLog log);

    @Select("<script>" +
            "SELECT * FROM audit_logs WHERE 1=1 " +
            "<if test='entityType != null'> AND entity_type = #{entityType} </if>" +
            "<if test='actionType != null'> AND action_type = #{actionType} </if>" +
            "<if test='fromDate != null'> AND created_at &gt;= #{fromDate} </if>" +
            "<if test='toDate != null'> AND created_at &lt;= #{toDate} </if>" +
            "ORDER BY created_at DESC" +
            "</script>")
    @Results({
            @Result(property = "logId", column = "log_id"),
            @Result(property = "actorUserId", column = "actor_user_id"),
            @Result(property = "actorEmail", column = "actor_email"),
            @Result(property = "actionType", column = "action_type"),
            @Result(property = "entityType", column = "entity_type"),
            @Result(property = "entityId", column = "entity_id"),
            @Result(property = "oldValueJson", column = "old_value_json"),
            @Result(property = "newValueJson", column = "new_value_json"),
            @Result(property = "affectedRolesCount", column = "affected_roles_count"),
            @Result(property = "affectedUsersCount", column = "affected_users_count"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "ipAddress", column = "ip_address")
    })
    List<AuditLog> findAll(@Param("entityType") String entityType,
            @Param("actionType") String actionType,
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate);
}
