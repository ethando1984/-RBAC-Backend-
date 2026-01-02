package com.aitech.rbac.mapper;

import com.aitech.rbac.model.AuditLog;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface AuditLogMapper {
        void insert(AuditLog log);

        List<AuditLog> findAll(@Param("entityType") String entityType,
                        @Param("actionType") String actionType,
                        @Param("fromDate") String fromDate,
                        @Param("toDate") String toDate);
}
