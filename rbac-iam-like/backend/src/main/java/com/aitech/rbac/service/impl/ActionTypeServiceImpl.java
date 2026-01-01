package com.aitech.rbac.service.impl;

import com.aitech.rbac.mapper.ActionTypeMapper;
import com.aitech.rbac.model.ActionType;
import com.aitech.rbac.service.ActionTypeService;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ActionTypeServiceImpl implements ActionTypeService {
    private final ActionTypeMapper mapper;
    public ActionTypeServiceImpl(ActionTypeMapper mapper) { this.mapper = mapper; }

    public List<ActionType> getAll() { return mapper.findAll(); }
    public ActionType getById(UUID id) { return mapper.findById(id); }
    public void create(ActionType entity) { mapper.insert(entity); }
    public void update(ActionType entity) { mapper.update(entity); }
    public void delete(UUID id) { mapper.delete(id); }
}
