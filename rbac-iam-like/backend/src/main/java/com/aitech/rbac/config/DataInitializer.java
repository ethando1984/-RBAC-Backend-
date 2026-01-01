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
                        OrderMapper orderMapper,
                        ProductMapper productMapper,
                        PasswordEncoder passwordEncoder) {
                return args -> {
                        if (userMapper.findByUsername("admin") != null) {
                                return;
                        }

                        System.out.println("Starting Database Seeding with Rich IAM Examples...");

                        // 1. Create Users
                        User admin = createUser(userMapper, passwordEncoder, "admin", "admin@aitech.com", "admin");
                        User manager = createUser(userMapper, passwordEncoder, "manager", "manager@aitech.com",
                                        "manager");
                        User editor = createUser(userMapper, passwordEncoder, "editor", "editor@aitech.com", "editor");
                        User viewer = createUser(userMapper, passwordEncoder, "viewer", "viewer@aitech.com", "viewer");
                        User sales = createUser(userMapper, passwordEncoder, "sales_rep", "sales@aitech.com", "sales");

                        // 2. Create Namespaces (Domains)
                        Namespace globalNs = createNamespace(namespaceMapper, "*", "Global Domain (Wildcard)");
                        Namespace systemNs = createNamespace(namespaceMapper, "system", "Infrastructure & IAM");
                        Namespace ordersNs = createNamespace(namespaceMapper, "orders", "Commercial Orders");
                        Namespace inventoryNs = createNamespace(namespaceMapper, "inventory", "Warehouse Inventory");
                        Namespace marketingNs = createNamespace(namespaceMapper, "marketing", "Marketing Campaigns");

                        // 3. Create Action Types
                        ActionType allAct = createActionType(actionTypeMapper, "*", "Full Control (Wildcard)");
                        ActionType readAct = createActionType(actionTypeMapper, "READ", "View/List access");
                        ActionType writeAct = createActionType(actionTypeMapper, "WRITE", "Create/Edit access");
                        ActionType deleteAct = createActionType(actionTypeMapper, "DELETE", "Remove access");
                        ActionType publishAct = createActionType(actionTypeMapper, "PUBLISH", "Go-live action");

                        // 4. Create Permissions (Logical Policies)
                        Permission fullAccess = createPermission(permissionMapper, "FullSystemAccess",
                                        "Unlimited access to all resources");
                        Permission iamAdmin = createPermission(permissionMapper, "IAM_Management",
                                        "Manage users, roles and permissions");
                        Permission inventoryManage = createPermission(permissionMapper, "Inventory_Management",
                                        "Update warehouse stock");
                        Permission ordersProcess = createPermission(permissionMapper, "Orders_Processing",
                                        "Read and Write commercial orders");
                        Permission ordersView = createPermission(permissionMapper, "Orders_ReadOnly",
                                        "View orders without modification");
                        Permission marketingCampaigns = createPermission(permissionMapper, "Marketing_Admin",
                                        "Full control over campaigns");

                        // 5. Link Permissions to Resources (Low-level mappings)
                        createResourceAccess(resourceAccessMapper, fullAccess.getPermissionId(),
                                        globalNs.getNamespaceId(),
                                        allAct.getActionTypeId());

                        createResourceAccess(resourceAccessMapper, iamAdmin.getPermissionId(),
                                        systemNs.getNamespaceId(),
                                        allAct.getActionTypeId());

                        createResourceAccess(resourceAccessMapper, inventoryManage.getPermissionId(),
                                        inventoryNs.getNamespaceId(),
                                        writeAct.getActionTypeId());
                        createResourceAccess(resourceAccessMapper, inventoryManage.getPermissionId(),
                                        inventoryNs.getNamespaceId(),
                                        readAct.getActionTypeId());

                        createResourceAccess(resourceAccessMapper, ordersProcess.getPermissionId(),
                                        ordersNs.getNamespaceId(),
                                        readAct.getActionTypeId());
                        createResourceAccess(resourceAccessMapper, ordersProcess.getPermissionId(),
                                        ordersNs.getNamespaceId(),
                                        writeAct.getActionTypeId());

                        createResourceAccess(resourceAccessMapper, ordersView.getPermissionId(),
                                        ordersNs.getNamespaceId(),
                                        readAct.getActionTypeId());

                        createResourceAccess(resourceAccessMapper, marketingCampaigns.getPermissionId(),
                                        marketingNs.getNamespaceId(), allAct.getActionTypeId());

                        // 6. Create Roles
                        Role superAdminRole = createRole(roleMapper, "Super Administrator", "Full system owner", true);
                        Role opsManagerRole = createRole(roleMapper, "Operations Manager",
                                        "Handles orders and inventory", false);
                        Role warehouseClerkRole = createRole(roleMapper, "Warehouse Clerk", "Updates stock levels",
                                        false);
                        Role auditorRole = createRole(roleMapper, "Security Auditor", "System monitoring and logs",
                                        false);
                        Role marketingLeadRole = createRole(roleMapper, "Marketing Lead",
                                        "Manages campaigns and strategy", false);

                        // 7. Assign Permissions to Roles
                        assignPermission(rolePermissionMapper, superAdminRole.getRoleId(),
                                        fullAccess.getPermissionId());
                        assignPermission(rolePermissionMapper, superAdminRole.getRoleId(), iamAdmin.getPermissionId());

                        assignPermission(rolePermissionMapper, opsManagerRole.getRoleId(),
                                        ordersProcess.getPermissionId());
                        assignPermission(rolePermissionMapper, opsManagerRole.getRoleId(),
                                        inventoryManage.getPermissionId());

                        assignPermission(rolePermissionMapper, warehouseClerkRole.getRoleId(),
                                        inventoryManage.getPermissionId());

                        assignPermission(rolePermissionMapper, auditorRole.getRoleId(), iamAdmin.getPermissionId()); // Note:
                                                                                                                     // should
                                                                                                                     // probably
                                                                                                                     // be
                                                                                                                     // a
                                                                                                                     // separate
                                                                                                                     // READ_IAM
                        assignPermission(rolePermissionMapper, auditorRole.getRoleId(), ordersView.getPermissionId());

                        assignPermission(rolePermissionMapper, marketingLeadRole.getRoleId(),
                                        marketingCampaigns.getPermissionId());

                        // 8. Assign Roles to Users
                        assignRoleToUser(userRoleMapper, admin.getUserId(), superAdminRole.getRoleId());
                        assignRoleToUser(userRoleMapper, manager.getUserId(), opsManagerRole.getRoleId());
                        assignRoleToUser(userRoleMapper, editor.getUserId(), warehouseClerkRole.getRoleId());
                        assignRoleToUser(userRoleMapper, viewer.getUserId(), auditorRole.getRoleId());
                        assignRoleToUser(userRoleMapper, sales.getUserId(), marketingLeadRole.getRoleId());

                        // 9. Seed Orders
                        seedOrders(orderMapper);
                        // 10. Seed Products
                        seedProducts(productMapper);

                        System.out.println("Enhanced Database Seeding Completed.");
                };
        }

        private User createUser(UserMapper mapper, PasswordEncoder encoder, String username, String email,
                        String pass) {
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

        private void seedOrders(OrderMapper mapper) {
                createOrder(mapper, "Alice Smith", new java.math.BigDecimal("1250.50"), "COMPLETED");
                createOrder(mapper, "Bob Johnson", new java.math.BigDecimal("450.00"), "PENDING");
                createOrder(mapper, "Charlie Brown", new java.math.BigDecimal("99.99"), "SHIPPED");
        }

        private void createOrder(OrderMapper mapper, String customer, java.math.BigDecimal amount, String status) {
                Order o = new Order();
                o.setOrderId(UUID.randomUUID());
                o.setCustomerName(customer);
                o.setTotalAmount(amount);
                o.setStatus(status);
                o.setOrderDate(LocalDateTime.now());
                mapper.insert(o);
        }

        private void seedProducts(ProductMapper mapper) {
                createProduct(mapper, "MacBook Pro M3", "LAP-001", new java.math.BigDecimal("2499.00"), 15,
                                "Electronics");
                createProduct(mapper, "iPhone 15 Pro", "PHN-002", new java.math.BigDecimal("1099.00"), 45,
                                "Electronics");
                createProduct(mapper, "Ergonomic Chair", "FUR-003", new java.math.BigDecimal("350.00"), 20,
                                "Furniture");
        }

        private void createProduct(ProductMapper mapper, String name, String sku, java.math.BigDecimal price, int stock,
                        String cat) {
                Product p = new Product();
                p.setProductId(UUID.randomUUID());
                p.setProductName(name);
                p.setSku(sku);
                p.setPrice(price);
                p.setStockQuantity(stock);
                p.setCategory(cat);
                mapper.insert(p);
        }

        private void assignRoleToUser(UserRoleMapper mapper, UUID userId, UUID roleId) {
                UserRole ur = new UserRole();
                ur.setUserId(userId);
                ur.setRoleId(roleId);
                ur.setAssignedAt(LocalDateTime.now());
                mapper.insert(ur);
        }
}
