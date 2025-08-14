package com.aitech.rbac.mapper;


import com.aitech.rbac.model.User;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface UserMapper {
    @Select("SELECT * FROM users")
    List<User> findAll();

    @Select("SELECT * FROM users WHERE user_id = #{id}")
    User findById(UUID id);

    @Insert("INSERT INTO users(user_id, username, email, password_hash, is_active, created_at, updated_at) " +
            "VALUES(#{userId}, #{username}, #{email}, #{passwordHash}, #{isActive}, #{createdAt}, #{updatedAt})")
    void insert(User user);

    @Update("UPDATE users SET username=#{username}, email=#{email}, is_active=#{isActive}, updated_at=#{updatedAt} WHERE user_id=#{userId}")
    void update(User user);

    @Delete("DELETE FROM users WHERE user_id=#{id}")
    void delete(UUID id);
}
