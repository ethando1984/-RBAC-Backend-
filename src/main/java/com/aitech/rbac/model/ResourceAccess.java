package com.aitech.rbac.model;

import lombok.Data;
import java.util.*;

@Data
public class ResourceAccess {
    private UUID permissionId;
    private UUID namespaceId;
    private UUID actionTypeId;
}
