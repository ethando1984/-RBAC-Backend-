package com.hyperion.cms.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ ElementType.METHOD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireCategoryPermission {
    String namespace();

    String action();

    /**
     * Name of the parameter in the method arguments that holds the categoryId (UUID
     * or String).
     * Or a path like "dto.categoryId" to extract from a field.
     */
    String categoryIdParam();
}
