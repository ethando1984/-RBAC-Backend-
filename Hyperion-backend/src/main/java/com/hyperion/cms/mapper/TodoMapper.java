package com.hyperion.cms.mapper;

import com.hyperion.cms.model.Todo;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface TodoMapper {

    @Select("SELECT * FROM todos WHERE user_id = #{userId} ORDER BY created_at DESC")
    List<Todo> findAllByUserId(String userId);

    @Select("SELECT * FROM todos WHERE id = #{id}")
    Todo findById(UUID id);

    @Insert("INSERT INTO todos (id, title, completed, user_id, created_at, updated_at) " +
            "VALUES (#{id}, #{title}, #{completed}, #{userId}, #{createdAt}, #{updatedAt})")
    void insert(Todo todo);

    @Update("UPDATE todos SET title=#{title}, completed=#{completed}, updated_at=#{updatedAt} " +
            "WHERE id=#{id}")
    void update(Todo todo);

    @Delete("DELETE FROM todos WHERE id = #{id}")
    void delete(UUID id);
}
