package com.hyperion.gateway.model;

import lombok.Data;
import java.util.UUID;

@Data
public class TagDto {
    private UUID id;
    private String name;
    private String slug;
    private String redirectTo;
    private String canonicalSlug;
}
