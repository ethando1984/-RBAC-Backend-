package com.aitech.rbac.mapper;

import com.aitech.rbac.model.User;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface UserMapper {
    @Select("SELECT * FROM \"users\"")
    @Results({
            @Result(property = "userId", column = "user_id", id = true),
            @Result(property = "username", column = "username"),
            @Result(property = "email", column = "email"),
            @Result(property = "passwordHash", column = "password_hash"),
            @Result(property = "isActive", column = "is_active"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "updatedAt", column = "updated_at"),
            @Result(property = "roles", column = "user_id", many = @Many(select = "com.aitech.rbac.mapper.RoleMapper.findByUserId"))
    })
    List<User> findAll();

    @Select("SELECT * FROM \"users\" WHERE user_id = #{id}")
    @Results({
            @Result(property = "userId", column = "user_id", id = true),
            @Result(property = "username", column = "username"),
            @Result(property = "email", column = "email"),
            @Result(property = "passwordHash", column = "password_hash"),
            @Result(property = "isActive", column = "is_active"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "updatedAt", column = "updated_at"),
            @Result(property = "roles", column = "user_id", many = @Many(select = "com.aitech.rbac.mapper.RoleMapper.findByUserId"))
    })
    User findById(UUID id);

    @Select("SELECT * FROM \"users\" WHERE username = #{username}")
    User findByUsername(String username);

    @Insert("INSERT INTO \"users\"(user_id, username, email, password_hash, is_active, created_at, updated_at) " +
            "VALUES(#{userId}, #{username}, #{email}, #{passwordHash}, #{isActive}, #{createdAt}, #{updatedAt})")
    void insert(User user);

    @Update("UPDATE \"users\" SET username=#{username}, email=#{email}, is_active=#{isActive}, updated_at=#{updatedAt} WHERE user_id=#{userId}")
    void update(User user);

    @Delete("DELETE FROM \"users\" WHERE user_id=#{id}")
    void delete(UUID id);
}
