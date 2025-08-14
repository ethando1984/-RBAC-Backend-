package com.aitech.rbac.model;

import lombok.Data;
import java.util.*;
import java.time.LocalDateTime;

@Data
public class ActionType {
    private UUID actionTypeId;
    private String actionKey;
    private String description;
}
