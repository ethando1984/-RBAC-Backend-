package com.aitech.rbac.service;

import com.aitech.rbac.model.Role;
import java.util.*;

public interface RoleService {
    List<Role> getAll();
    Role getById(UUID id);
    void create(Role entity);
    void update(Role entity);
    void delete(UUID id);
}
