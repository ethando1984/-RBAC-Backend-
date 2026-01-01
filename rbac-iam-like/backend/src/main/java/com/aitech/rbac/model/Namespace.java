package com.aitech.rbac.model;

import lombok.Data;
import java.util.*;
import java.time.LocalDateTime;

@Data
public class Namespace {
    private UUID namespaceId;
    private String namespaceKey;
    private String description;
}
