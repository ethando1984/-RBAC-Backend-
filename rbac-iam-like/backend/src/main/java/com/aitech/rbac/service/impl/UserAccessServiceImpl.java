package com.aitech.rbac.service.impl;

import com.aitech.rbac.dto.UserAccessDTO;
import com.aitech.rbac.dto.UserAccessFlatDTO;
import com.aitech.rbac.mapper.UserAccessMapper;
import com.aitech.rbac.service.UserAccessService;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserAccessServiceImpl implements UserAccessService {
    private final UserAccessMapper mapper;

    public UserAccessServiceImpl(UserAccessMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public List<UserAccessDTO> getUserAccess(UUID userId) {
        List<UserAccessFlatDTO> flatList = mapper.getUserAccess(userId);
        if (flatList.isEmpty()) {
            return Collections.emptyList();
        }

        UserAccessDTO userAccess = new UserAccessDTO();
        // Since we query by userId, all rows have same user info
        userAccess.setUserId(flatList.get(0).getUserId());
        userAccess.setUsername(flatList.get(0).getUsername());
        userAccess.setRoles(new ArrayList<>());

        Map<UUID, UserAccessDTO.RoleDTO> roleMap = new HashMap<>();

        for (UserAccessFlatDTO flat : flatList) {
            UUID roleId = flat.getRoleId();
            if (roleId == null)
                continue;

            UserAccessDTO.RoleDTO roleDTO = roleMap.get(roleId);
            if (roleDTO == null) {
                roleDTO = new UserAccessDTO.RoleDTO();
                roleDTO.setRoleId(roleId);
                roleDTO.setRoleName(flat.getRoleName());
                roleDTO.setPermissions(new ArrayList<>());
                roleMap.put(roleId, roleDTO);
                userAccess.getRoles().add(roleDTO);
            }

            if (flat.getPermissionId() == null)
                continue;

            UserAccessDTO.PermissionDTO permDTO = new UserAccessDTO.PermissionDTO();
            permDTO.setPermissionId(flat.getPermissionId());
            permDTO.setPermissionName(flat.getPermissionName());
            permDTO.setNamespaceKey(flat.getNamespaceKey());
            permDTO.setActionKey(flat.getActionKey());

            roleDTO.getPermissions().add(permDTO);
        }

        return List.of(userAccess);
    }
}
