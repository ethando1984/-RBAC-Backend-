package com.aitech.rbac.handler;

import com.aitech.rbac.security.DecisionReason;
import com.aitech.rbac.security.PermissionDecision;
import com.aitech.rbac.security.PermissionDeniedException;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.UUID;

@ControllerAdvice
public class GlobalExceptionHandler {

    @Data
    @Builder
    public static class ErrorResponse {
        private String error;
        private DecisionReason reasonCode;
        private String message;
        private String namespace;
        private String action;
        private UUID categoryId;
        private String correlationId;
    }

    @ExceptionHandler(PermissionDeniedException.class)
    public ResponseEntity<ErrorResponse> handlePermissionDenied(PermissionDeniedException ex) {
        PermissionDecision decision = ex.getDecision();
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErrorResponse.builder()
                        .error("FORBIDDEN")
                        .reasonCode(decision.getReasonCode())
                        .message(ex.getMessage())
                        .namespace(decision.getNamespace())
                        .action(decision.getAction())
                        .categoryId(decision.getCategoryId())
                        .correlationId(UUID.randomUUID().toString()) // Should come from MDC
                        .build());
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            org.springframework.security.access.AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErrorResponse.builder()
                        .error("FORBIDDEN")
                        .reasonCode(DecisionReason.DENIED_BY_DEFAULT)
                        .message(ex.getMessage())
                        .correlationId(UUID.randomUUID().toString())
                        .build());
    }
}
