package com.aitech.rbac.service;

import com.aitech.rbac.model.ActionType;
import java.util.*;

public interface ActionTypeService {
    List<ActionType> getAll();
    ActionType getById(UUID id);
    void create(ActionType entity);
    void update(ActionType entity);
    void delete(UUID id);
}
