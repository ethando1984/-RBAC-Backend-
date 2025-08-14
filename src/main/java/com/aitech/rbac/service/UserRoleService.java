package com.aitech.rbac.service;

import com.aitech.rbac.model.UserRole;
import java.util.*;

public interface UserRoleService {
    List<UserRole> getAll();
    UserRole getById(UUID id);
    void create(UserRole entity);
    void update(UserRole entity);
    void delete(UUID id);
}
