package com.aitech.rbac.service;

import com.aitech.rbac.model.User;
import java.util.*;

public interface UserService {
    List<User> getAll();
    User getById(UUID id);
    User findByUsername(String username);
    void create(User entity);
    void update(User entity);
    void delete(UUID id);
}
