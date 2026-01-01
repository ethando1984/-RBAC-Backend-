package com.aitech.rbac.mapper;

import com.aitech.rbac.model.User;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface UserMapper {
        List<User> findAll();

        User findById(UUID id);

        User findByUsername(String username);

        void insert(User user);

        void update(User user);

        void delete(UUID id);
}
