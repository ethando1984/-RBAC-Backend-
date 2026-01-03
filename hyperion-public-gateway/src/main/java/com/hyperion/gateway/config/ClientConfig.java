package com.hyperion.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class ClientConfig {

    @Value("${hyperion.cms.url}")
    private String cmsBaseUrl;

    @Value("${hyperion.cms.service-name}")
    private String serviceName;

    @Value("${hyperion.cms.service-token}")
    private String serviceToken;

    @Bean
    public RestClient cmsRestClient(RestClient.Builder builder) {
        return builder
                .baseUrl(cmsBaseUrl)
                .defaultHeader("X-Service-Name", serviceName)
                .defaultHeader("X-Service-Token", serviceToken)
                .build();
    }
}
