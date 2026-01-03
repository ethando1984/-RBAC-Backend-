package com.hyperion.cms.security;

import com.hyperion.cms.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class PermissionAspect {

    private final PermissionService permissionService;
    private final AuditService auditService;
    private final ExpressionParser parser = new SpelExpressionParser();

    @Before("@annotation(requirePermission)")
    public void checkPermission(JoinPoint joinPoint, RequirePermission requirePermission) {
        String namespace = requirePermission.namespace();
        String action = requirePermission.action();

        PermissionDecision decision = permissionService.evaluate(namespace, action, null, null);

        auditService.logDecision(decision);

        if (!decision.isAllowed()) {
            throw new PermissionDeniedException(decision);
        }
    }

    @Before("@annotation(requireCategoryPermission)")
    public void checkCategoryPermission(JoinPoint joinPoint, RequireCategoryPermission requireCategoryPermission) {
        String namespace = requireCategoryPermission.namespace();
        String action = requireCategoryPermission.action();
        String paramName = requireCategoryPermission.categoryIdParam();

        UUID categoryId = resolveCategoryId(joinPoint, paramName);

        PermissionDecision decision = permissionService.evaluate(namespace, action, categoryId, null);

        auditService.logDecision(decision);

        if (!decision.isAllowed()) {
            throw new PermissionDeniedException(decision);
        }
    }

    private UUID resolveCategoryId(JoinPoint joinPoint, String paramExpression) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();

        StandardEvaluationContext context = new StandardEvaluationContext();
        for (int i = 0; i < parameterNames.length; i++) {
            context.setVariable(parameterNames[i], args[i]);
        }

        try {
            Object value = parser.parseExpression(paramExpression).getValue(context);
            if (value == null)
                return null;
            if (value instanceof UUID)
                return (UUID) value;
            if (value instanceof String)
                return UUID.fromString((String) value);
            return null;
        } catch (Exception e) {
            log.error("Failed to resolve categoryId from expression: {}", paramExpression, e);
            return null;
        }
    }
}
