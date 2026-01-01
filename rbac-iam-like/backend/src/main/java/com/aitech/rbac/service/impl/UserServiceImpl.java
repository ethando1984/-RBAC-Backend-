package com.aitech.rbac.service.impl;

import com.aitech.rbac.mapper.UserMapper;
import com.aitech.rbac.model.User;
import com.aitech.rbac.service.UserService;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class UserServiceImpl implements UserService {
    private final UserMapper mapper;

    public UserServiceImpl(UserMapper mapper) {
        this.mapper = mapper;
    }

    public List<User> getAll() {
        return mapper.findAll();
    }

    public User getById(UUID id) {
        return mapper.findById(id);
    }

    public User findByUsername(String username) {
        return mapper.findByUsername(username);
    }

    public void create(User entity) {
        if (entity.getUserId() == null) {
            entity.setUserId(java.util.UUID.randomUUID());
        }
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(java.time.LocalDateTime.now());
        }
        entity.setUpdatedAt(java.time.LocalDateTime.now());
        mapper.insert(entity);
    }

    public void update(User entity) {
        mapper.update(entity);
    }

    public void delete(UUID id) {
        mapper.delete(id);
    }
}
