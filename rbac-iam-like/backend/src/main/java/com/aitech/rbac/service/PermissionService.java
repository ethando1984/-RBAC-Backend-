package com.aitech.rbac.service;

import com.aitech.rbac.model.Permission;
import java.util.*;

public interface PermissionService {
    List<Permission> getAll();
    Permission getById(UUID id);
    void create(Permission entity);
    void update(Permission entity);
    void delete(UUID id);
}
