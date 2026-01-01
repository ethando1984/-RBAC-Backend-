package com.aitech.rbac.service.impl;

import com.aitech.rbac.dto.PageResponse;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
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
        return mapper.findAll(null);
    }

    public PageResponse<User> getAll(int page, int size, String search) {
        PageHelper.startPage(page, size);
        List<User> users = mapper.findAll(search);
        PageInfo<User> pageInfo = new PageInfo<>(users);
        return new PageResponse<>(users, pageInfo.getTotal(), page, size);
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
        entity.setUpdatedAt(java.time.LocalDateTime.now());
        mapper.update(entity);
    }

    public void delete(UUID id) {
        mapper.delete(id);
    }
}
