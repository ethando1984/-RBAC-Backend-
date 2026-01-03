package com.aitech.rbac.security;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Slf4j
@Component
public class IamCenterClient {

    private final RestTemplate restTemplate;

    @Value("${iam.center.url:https://iam.internal}")
    private String iamCenterUrl;

    @Value("${iam.service.name:hyperion-cms}")
    private String serviceName;

    @Value("${iam.service.token:secret-token}")
    private String serviceToken;

    public IamCenterClient() {
        this.restTemplate = new RestTemplate();
    }

    @Data
    @Builder
    public static class EvaluateRequest {
        private String userId;
        private String namespace;
        private String action;
        private UUID categoryId;
        private String resourceId;
    }

    @Data
    public static class EvaluateResponse {
        private boolean allowed;
        private String reason;
        private String matchedPolicy;
        private String matchedRole;
    }

    @Cacheable(value = "iamRemoteDecisions", key = "#request.userId + #request.namespace + #request.action + #request.categoryId")
    @CircuitBreaker(name = "iamCenter", fallbackMethod = "fallbackEvaluate")
    public EvaluateResponse evaluate(EvaluateRequest request, String correlationId, String userToken) {
        log.info("Calling Remote IAM for user: {} on {}:{}", request.userId, request.namespace, request.action);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Service-Name", serviceName);
        headers.set("X-Service-Token", serviceToken);
        headers.set("X-Correlation-Id", correlationId);
        if (userToken != null) {
            headers.set("Authorization", "Bearer " + userToken);
        }

        HttpEntity<EvaluateRequest> entity = new HttpEntity<>(request, headers);

        // This is a placeholder for the actual API call
        // return restTemplate.postForObject(iamCenterUrl + "/iam/access/evaluate",
        // entity, EvaluateResponse.class);

        // For demonstration/testing, we return a simulated response if API not
        // available
        throw new RuntimeException("Remote IAM API not connected");
    }

    public EvaluateResponse fallbackEvaluate(EvaluateRequest request, String correlationId, String userToken,
            Throwable t) {
        log.error("IAM Center fallback triggered for {}:{}. Reason: {}", request.namespace, request.action,
                t.getMessage());
        EvaluateResponse response = new EvaluateResponse();
        response.setAllowed(false);
        response.setReason("REMOTE_IAM_UNAVAILABLE");
        return response;
    }
}
