package com.hyperion.cms.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for mTLS service-to-service authentication.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "hyperion.mtls")
public class MtlsProperties {

    /**
     * Enable/disable mTLS for IAM Center calls
     */
    private boolean enabled = false;

    /**
     * Path to client certificate (PEM or JKS)
     */
    private String clientCertPath;

    /**
     * Path to client private key
     */
    private String clientKeyPath;

    /**
     * Client certificate password (if applicable)
     */
    private String clientCertPassword;

    /**
     * Path to trusted CA certificates for server validation
     */
    private String trustedCaPath;

    /**
     * Service name to include in X-Service-Name header
     */
    private String serviceName = "hyperion-cms";

    /**
     * Service token for X-Service-Token header
     */
    private String serviceToken;

    /**
     * IAM Center base URL
     */
    private String iamCenterUrl = "https://iam-center.internal:8443";

    /**
     * Connection timeout in milliseconds
     */
    private int connectionTimeout = 5000;

    /**
     * Read timeout in milliseconds
     */
    private int readTimeout = 10000;
}
