package com.aitech.rbac.service.impl;

import com.aitech.rbac.dto.UserAccessDTO;
import com.aitech.rbac.mapper.UserAccessMapper;
import com.aitech.rbac.service.UserAccessService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserAccessServiceImpl implements UserAccessService {
    private final UserAccessMapper mapper;

    public UserAccessServiceImpl(UserAccessMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public List<UserAccessDTO> getUserAccess(UUID userId) {
        return mapper.getUserAccess(userId);
    }
}
