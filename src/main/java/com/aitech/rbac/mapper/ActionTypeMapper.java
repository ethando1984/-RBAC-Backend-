package com.aitech.rbac.mapper;

import com.aitech.rbac.model.ActionType;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ActionTypeMapper {
    @Select("SELECT * FROM action_types")
    List<ActionType> findAll();

    @Select("SELECT * FROM action_types WHERE action_type_id = #{id}")
    ActionType findById(UUID id);

    @Insert("INSERT INTO action_types(action_type_id, action_key, description) " +
            "VALUES(#{actionTypeId}, #{actionKey}, #{description})")
    void insert(ActionType actionType);

    @Update("UPDATE action_types SET action_key=#{actionKey}, description=#{description} WHERE action_type_id=#{actionTypeId}")
    void update(ActionType actionType);

    @Delete("DELETE FROM action_types WHERE action_type_id=#{id}")
    void delete(UUID id);
}
