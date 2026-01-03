# Hyperion CMS - Production Security Architecture

## Overview

Hyperion CMS implements enterprise-grade security with JWT authentication, Redis caching, mTLS service-to-service communication, and comprehensive audit logging.

## Architecture Components

### 1. Authentication & Authorization

#### JWT Validation
- **No User Management**: Hyperion CMS does NOT manage users directly
- **JWT Validation**: All JWTs are validated against the IAM Center
- **Claims Extraction**: Permissions extracted from JWT claims (`permissions`, `categoryScopes`)
- **Fallback**: Remote IAM Center evaluation via mTLS for missing or expired claims

#### Permission Evaluation Flow
```
1. Extract JWT from Authorization header
2. Check JWT claims for permissions (fast path)
3. If not in JWT → Call IAM Center via mTLS (with caching)
4. Cache result in Redis (5-10 min TTL)
5. Log decision to audit service
```

### 2. Redis Caching

#### Cache Configuration
- **Cache Type**: Redis with Lettuce connection pool
- **TTL Settings**:
  - `permissions`: 5 minutes
  - `iamEvaluations`: 10 minutes
- **Cache Key Format**: `userId:namespace:action:categoryId`
- **Null Value Handling**: Disabled (don't cache denials)

#### Cache Invalidation
- Automatic TTL expiration
- Manual invalidation on permission changes (via IAM Center webhook)

### 3. mTLS Service-to-Service Authentication

#### Configuration
All Hyperion → IAM Center calls use mutual TLS:

```yaml
hyperion:
  mtls:
    enabled: true
    client-cert-path: /etc/hyperion/certs/client.jks
    client-key-path: /etc/hyperion/certs/client-key.pem
    client-cert-password: ${MTLS_CLIENT_CERT_PASSWORD}
    trusted-ca-path: /etc/hyperion/certs/ca-trust.jks
    service-name: hyperion-cms
    service-token: ${IAM_SERVICE_TOKEN}
    iam-center-url: https://iam-center.internal:8443
```

#### Request Headers
Every IAM Center call includes:
- `X-Service-Name`: Service identifier (hyperion-cms)
- `X-Service-Token`: Service authentication token
- `X-Correlation-ID`: Request tracing ID
- `Authorization`: User JWT (for context)

#### Certificate Management
- **Rotation**: Certificates rotated per environment (dev/staging/prod)
- **Storage**: Stored in Kubernetes secrets or HashiCorp Vault
- **Validation**: Server certificate validated against internal CA

### 4. Correlation-ID Propagation

#### Purpose
- **Request Tracing**: Track requests across services
- **Debugging**: Correlate logs across Hyperion CMS and IAM Center
- **Audit**: Link permission decisions to original requests

#### Implementation
```java
// Filter extracts or generates correlation-ID
@Component
public class CorrelationIdFilter extends OncePerRequestFilter {
    // Stores in MDC for logging
    // Propagates to downstream services
    // Returns in response header
}
```

#### MDC Integration
```
%d{yyyy-MM-dd HH:mm:ss} [%thread] [%X{correlationId}] %-5level %logger{36} - %msg%n
```

### 5. Resilience Patterns

#### Circuit Breaker
```yaml
resilience4j:
  circuitbreaker:
    instances:
      iamCenter:
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        failureRateThreshold: 50
        waitDurationInOpenState: 30s
```

**Behavior**:
- After 50% failure rate (5/10 calls), circuit opens
- Waits 30 seconds before attempting recovery
- Fallback: Deny access by default

#### Retry Policy
```yaml
resilience4j:
  retry:
    instances:
      iamCenter:
        maxAttempts: 3
        waitDuration: 500ms
        enableExponentialBackoff: true
        exponentialBackoffMultiplier: 2
```

**Behavior**:
- Retry on `IOException` and `ResourceAccessException`
- Exponential backoff: 500ms → 1s → 2s

### 6. Audit Logging

#### Logged Events
- All permission decisions (allowed/denied)
- IAM Center calls (with correlation-ID)
- mTLS authentication attempts
- Circuit breaker state changes

#### Audit Data
```json
{
  "userId": "uuid",
  "namespace": "articles",
  "action": "publish",
  "allowed": false,
  "reason": "DENIED_BY_JWT",
  "source": "JWT",
  "categoryId": "uuid",
  "correlationId": "uuid",
  "timestamp": "2026-01-03T15:00:00Z"
}
```

## Security Best Practices

### 1. Defense in Depth
- **Layer 1**: JWT validation
- **Layer 2**: Permission checks in JWT claims
- **Layer 3**: Remote IAM evaluation
- **Layer 4**: RBAC annotations on controllers
- **Layer 5**: Audit logging

### 2. Least Privilege
- Default deny policy
- Explicit permission grants required
- Category-scoped permissions for fine-grained control

### 3. Fail Secure
- Circuit breaker denies access when IAM Center unavailable
- Invalid JWTs rejected immediately
- Missing permissions = access denied

### 4. Observability
- Correlation-ID in all logs
- MDC propagation across threads
- Audit trail for compliance

## Environment Configuration

### Development
```bash
# Disable mTLS for local development
export MTLS_ENABLED=false
export REDIS_HOST=localhost
export REDIS_PORT=6379
```

### Production
```bash
# Enable mTLS with proper certificates
export MTLS_ENABLED=true
export MTLS_CLIENT_CERT_PATH=/etc/hyperion/certs/client.jks
export MTLS_CLIENT_CERT_PASSWORD=<secret>
export MTLS_TRUSTED_CA_PATH=/etc/hyperion/certs/ca-trust.jks
export IAM_SERVICE_TOKEN=<secret>
export IAM_CENTER_URL=https://iam-center.internal:8443

# Redis configuration
export REDIS_HOST=redis.internal
export REDIS_PORT=6379
export REDIS_PASSWORD=<secret>
```

## Performance Considerations

### Caching Strategy
- **Cache Hit Rate**: Target 80%+ for permission checks
- **TTL Balance**: Short enough for security, long enough for performance
- **Memory Usage**: Monitor Redis memory consumption

### mTLS Overhead
- **Connection Pooling**: Reuse SSL connections
- **Certificate Caching**: Cache validated certificates
- **Timeout Tuning**: Balance security and user experience

## Monitoring & Alerts

### Key Metrics
- IAM Center response time (p50, p95, p99)
- Circuit breaker state changes
- Cache hit/miss ratio
- mTLS handshake failures
- Permission denial rate

### Alerts
- Circuit breaker open > 1 minute
- IAM Center response time > 2 seconds
- Cache hit rate < 70%
- mTLS certificate expiring < 7 days

## Troubleshooting

### Common Issues

#### 1. Permission Denied (Unexpected)
- Check JWT claims: `GET /api/whoami`
- Verify correlation-ID in logs
- Check IAM Center audit logs
- Validate cache TTL hasn't expired

#### 2. IAM Center Unavailable
- Check circuit breaker state
- Verify mTLS certificates valid
- Test network connectivity
- Review retry/timeout configuration

#### 3. Cache Inconsistency
- Flush Redis cache: `FLUSHDB`
- Verify TTL configuration
- Check for permission changes in IAM Center

## Security Checklist

- [ ] mTLS certificates installed and valid
- [ ] Service tokens rotated regularly
- [ ] Redis password configured
- [ ] Correlation-ID in all logs
- [ ] Circuit breaker tested
- [ ] Audit logs reviewed regularly
- [ ] Cache TTL appropriate for security requirements
- [ ] Fallback behavior tested (IAM Center down)

## References

- [Spring Security OAuth2 Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/index.html)
- [Resilience4j Documentation](https://resilience4j.readme.io/)
- [Redis Caching Best Practices](https://redis.io/docs/manual/patterns/)
- [mTLS in Microservices](https://www.nginx.com/blog/microservices-march-protect-kubernetes-apis-with-mtls/)
