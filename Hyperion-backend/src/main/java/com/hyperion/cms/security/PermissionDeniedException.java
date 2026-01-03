package com.hyperion.cms.security;

import lombok.Getter;
import org.springframework.security.access.AccessDeniedException;

@Getter
public class PermissionDeniedException extends AccessDeniedException {
    private final PermissionDecision decision;

    public PermissionDeniedException(PermissionDecision decision) {
        super("Access Denied: " + decision.getReasonCode());
        this.decision = decision;
    }
}
