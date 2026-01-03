package com.hyperion.cms.handler;

import com.hyperion.cms.security.PermissionDecision;
import com.hyperion.cms.security.PermissionDeniedException;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.UUID;

@ControllerAdvice
public class GlobalExceptionHandler {

    @Data
    @Builder
    public static class ErrorResponse {
        private String error;
        private String reasonCode;
        private String message;
        private String namespace;
        private String action;
        private UUID categoryId;
        private String correlationId;
    }

    @ExceptionHandler(PermissionDeniedException.class)
    public ResponseEntity<ErrorResponse> handlePermissionDenied(PermissionDeniedException ex) {
        PermissionDecision decision = ex.getDecision();
        ErrorResponse body = ErrorResponse.builder()
                .error("FORBIDDEN")
                .reasonCode(decision.getReasonCode().name())
                .message(ex.getMessage())
                .namespace(decision.getNamespace())
                .action(decision.getAction())
                .categoryId(decision.getCategoryId())
                .correlationId(UUID.randomUUID().toString())
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            org.springframework.security.access.AccessDeniedException ex) {
        ErrorResponse body = ErrorResponse.builder()
                .error("FORBIDDEN")
                .reasonCode("DENIED_BY_SPRING_SECURITY")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex) {
        ErrorResponse body = ErrorResponse.builder()
                .error("UNAUTHORIZED")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }
}
