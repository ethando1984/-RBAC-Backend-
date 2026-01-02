package com.aitech.rbac.service.impl;

import com.aitech.rbac.dto.PageResponse;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.aitech.rbac.mapper.UserMapper;
import com.aitech.rbac.model.User;
import com.aitech.rbac.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class UserServiceImpl implements UserService {
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserMapper mapper, PasswordEncoder passwordEncoder) {
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
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

        // Encode password if provided
        if (entity.getPasswordHash() != null && !entity.getPasswordHash().isEmpty()) {
            // Check if it's already encoded (bcrypt starts with $2a$, $2b$, or $2y$)
            if (!entity.getPasswordHash().startsWith("$2")) {
                entity.setPasswordHash(passwordEncoder.encode(entity.getPasswordHash()));
            }
        }

        mapper.insert(entity);
    }

    public void update(User entity) {
        entity.setUpdatedAt(java.time.LocalDateTime.now());

        // Handle password update: only encode if a new password is provided and it's
        // not already encoded
        if (entity.getPasswordHash() != null && !entity.getPasswordHash().isEmpty()) {
            if (!entity.getPasswordHash().startsWith("$2")) {
                entity.setPasswordHash(passwordEncoder.encode(entity.getPasswordHash()));
            }
        } else {
            // If no password provided, preserve the existing one
            User existing = mapper.findById(entity.getUserId());
            if (existing != null) {
                entity.setPasswordHash(existing.getPasswordHash());
            }
        }

        mapper.update(entity);
    }

    public void updateProfile(UUID userId, com.aitech.rbac.dto.ProfileUpdateDTO dto) {
        User user = mapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
            user.setEmail(dto.getEmail());
        }

        if (dto.getPreferences() != null) {
            user.setPreferencesJson(dto.getPreferences());
        }

        if (dto.getNewPassword() != null && !dto.getNewPassword().isEmpty()) {
            // Validate current password
            if (dto.getCurrentPassword() == null
                    || !passwordEncoder.matches(dto.getCurrentPassword(), user.getPasswordHash())) {
                throw new RuntimeException("Invalid current password");
            }
            user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        }

        user.setUpdatedAt(java.time.LocalDateTime.now());
        mapper.update(user);
    }

    public void delete(UUID id) {
        mapper.delete(id);
    }
}
