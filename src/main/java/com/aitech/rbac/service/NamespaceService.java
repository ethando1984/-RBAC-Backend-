package com.aitech.rbac.service;

import com.aitech.rbac.model.Namespace;
import java.util.*;

public interface NamespaceService {
    List<Namespace> getAll();
    Namespace getById(UUID id);
    void create(Namespace entity);
    void update(Namespace entity);
    void delete(UUID id);
}
