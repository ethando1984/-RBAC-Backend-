package com.aitech.rbac.mapper;

import com.aitech.rbac.model.ActionType;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ActionTypeMapper {
    List<ActionType> findAll();

    ActionType findById(UUID id);

    void insert(ActionType actionType);

    void update(ActionType actionType);

    void delete(UUID id);
}
