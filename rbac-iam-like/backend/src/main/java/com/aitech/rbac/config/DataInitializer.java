package com.aitech.rbac.config;

import com.aitech.rbac.mapper.*;
import com.aitech.rbac.model.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.UUID;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserMapper userMapper,
            RoleMapper roleMapper,
            PermissionMapper permissionMapper,
            NamespaceMapper namespaceMapper,
            ActionTypeMapper actionTypeMapper,
            UserRoleMapper userRoleMapper,
            RolePermissionMapper rolePermissionMapper,
            ResourceAccessMapper resourceAccessMapper,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if admin exists to prevent double seeding
            if (userMapper.findByUsername("admin") != null) {
                return;
            }

            System.out.println("Starting Database Seeding...");

            // 1. Create Users
            User admin = createUser(userMapper, passwordEncoder, "admin", "admin@example.com", "admin");
            User manager = createUser(userMapper, passwordEncoder, "manager", "manager@example.com", "manager");
            User editor = createUser(userMapper, passwordEncoder, "editor", "editor@example.com", "editor");
            User viewer = createUser(userMapper, passwordEncoder, "viewer", "viewer@example.com", "viewer");

            // 2. Create Namespaces
            Namespace globalNs = createNamespace(namespaceMapper, "*", "All Namespaces (Wildcard)");
            Namespace systemNs = createNamespace(namespaceMapper, "system", "System and IAM settings");
            Namespace ordersNs = createNamespace(namespaceMapper, "orders", "Customer Orders");
            Namespace inventoryNs = createNamespace(namespaceMapper, "inventory", "Product Inventory");

            // 3. Create Action Types
            ActionType allAct = createActionType(actionTypeMapper, "*", "All Actions (Wildcard)");
            ActionType readAct = createActionType(actionTypeMapper, "READ", "Read access");
            ActionType writeAct = createActionType(actionTypeMapper, "WRITE", "Write/Create access");
            ActionType deleteAct = createActionType(actionTypeMapper, "DELETE", "Delete access");

            // 4. Create Permissions
            Permission fullControl = createPermission(permissionMapper, "FULL_CONTROL",
                    "Unlimited access to everything");
            Permission manageSystem = createPermission(permissionMapper, "MANAGE_SYSTEM", "Manage system and IAM");
            Permission viewSystem = createPermission(permissionMapper, "VIEW_SYSTEM", "Read-only system access");
            Permission manageOrders = createPermission(permissionMapper, "MANAGE_ORDERS", "Create and process orders");
            Permission readOrders = createPermission(permissionMapper, "READ_ORDERS", "View customer orders");
            Permission editInventory = createPermission(permissionMapper, "EDIT_INVENTORY", "Update stock levels");

            // 5. Link Permissions to Resources (ResourceAccess Mapping)
            // FULL_CONTROL -> * : *
            createResourceAccess(resourceAccessMapper, fullControl.getPermissionId(), globalNs.getNamespaceId(),
                    allAct.getActionTypeId());

            // MANAGE_SYSTEM -> system : *
            createResourceAccess(resourceAccessMapper, manageSystem.getPermissionId(), systemNs.getNamespaceId(),
                    allAct.getActionTypeId());

            // VIEW_SYSTEM -> system : READ
            createResourceAccess(resourceAccessMapper, viewSystem.getPermissionId(), systemNs.getNamespaceId(),
                    readAct.getActionTypeId());

            // MANAGE_ORDERS -> orders : *
            createResourceAccess(resourceAccessMapper, manageOrders.getPermissionId(), ordersNs.getNamespaceId(),
                    allAct.getActionTypeId());

            // READ_ORDERS -> orders : READ
            createResourceAccess(resourceAccessMapper, readOrders.getPermissionId(), ordersNs.getNamespaceId(),
                    readAct.getActionTypeId());

            // EDIT_INVENTORY -> inventory : WRITE
            createResourceAccess(resourceAccessMapper, editInventory.getPermissionId(), inventoryNs.getNamespaceId(),
                    writeAct.getActionTypeId());

            // 6. Create Roles
            Role superAdminRole = createRole(roleMapper, "Super Administrator", "Full system owner", true);
            Role bizManagerRole = createRole(roleMapper, "Business Manager", "Manages orders and inventory", false);
            Role contentEditorRole = createRole(roleMapper, "Content Editor", "Updates inventory data", false);
            Role auditorRole = createRole(roleMapper, "Auditor", "Read-only access to system and orders", false);

            // 7. Assign Permissions to Roles
            assignPermission(rolePermissionMapper, superAdminRole.getRoleId(), fullControl.getPermissionId());

            assignPermission(rolePermissionMapper, bizManagerRole.getRoleId(), manageOrders.getPermissionId());
            assignPermission(rolePermissionMapper, bizManagerRole.getRoleId(), editInventory.getPermissionId());
            assignPermission(rolePermissionMapper, bizManagerRole.getRoleId(), viewSystem.getPermissionId());

            assignPermission(rolePermissionMapper, contentEditorRole.getRoleId(), editInventory.getPermissionId());
            assignPermission(rolePermissionMapper, contentEditorRole.getRoleId(), readOrders.getPermissionId());

            assignPermission(rolePermissionMapper, auditorRole.getRoleId(), viewSystem.getPermissionId());
            assignPermission(rolePermissionMapper, auditorRole.getRoleId(), readOrders.getPermissionId());

            // 8. Assign Roles to Users
            assignRoleToUser(userRoleMapper, admin.getUserId(), superAdminRole.getRoleId());
            assignRoleToUser(userRoleMapper, manager.getUserId(), bizManagerRole.getRoleId());
            assignRoleToUser(userRoleMapper, editor.getUserId(), contentEditorRole.getRoleId());
            assignRoleToUser(userRoleMapper, viewer.getUserId(), auditorRole.getRoleId());

            System.out.println("Database Seeding Completed Successfully.");
        };
    }

    private User createUser(UserMapper mapper, PasswordEncoder encoder, String username, String email, String pass) {
        User u = new User();
        u.setUserId(UUID.randomUUID());
        u.setUsername(username);
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(pass));
        u.setActive(true);
        u.setCreatedAt(LocalDateTime.now());
        u.setUpdatedAt(LocalDateTime.now());
        mapper.insert(u);
        return u;
    }

    private Role createRole(RoleMapper mapper, String name, String desc, boolean isSystem) {
        Role r = new Role();
        r.setRoleId(UUID.randomUUID());
        r.setRoleName(name);
        r.setDescription(desc);
        r.setSystemRole(isSystem);
        mapper.insert(r);
        return r;
    }

    private Namespace createNamespace(NamespaceMapper mapper, String key, String desc) {
        Namespace n = new Namespace();
        n.setNamespaceId(UUID.randomUUID());
        n.setNamespaceKey(key);
        n.setDescription(desc);
        mapper.insert(n);
        return n;
    }

    private ActionType createActionType(ActionTypeMapper mapper, String key, String desc) {
        ActionType a = new ActionType();
        a.setActionTypeId(UUID.randomUUID());
        a.setActionKey(key);
        a.setDescription(desc);
        mapper.insert(a);
        return a;
    }

    private Permission createPermission(PermissionMapper mapper, String name, String desc) {
        Permission p = new Permission();
        p.setPermissionId(UUID.randomUUID());
        p.setPermissionName(name);
        p.setDescription(desc);
        mapper.insert(p);
        return p;
    }

    private void createResourceAccess(ResourceAccessMapper mapper, UUID permId, UUID nsId, UUID actId) {
        ResourceAccess ra = new ResourceAccess();
        ra.setMappingId(UUID.randomUUID());
        ra.setPermissionId(permId);
        ra.setNamespaceId(nsId);
        ra.setActionTypeId(actId);
        mapper.insert(ra);
    }

    private void assignPermission(RolePermissionMapper mapper, UUID roleId, UUID permId) {
        RolePermission rp = new RolePermission();
        rp.setRoleId(roleId);
        rp.setPermissionId(permId);
        rp.setAssignedAt(LocalDateTime.now());
        mapper.insert(rp);
    }

    private void assignRoleToUser(UserRoleMapper mapper, UUID userId, UUID roleId) {
        UserRole ur = new UserRole();
        ur.setUserId(userId);
        ur.setRoleId(roleId);
        ur.setAssignedAt(LocalDateTime.now());
        mapper.insert(ur);
    }
}
