package com.hyperion.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class PublicGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(PublicGatewayApplication.class, args);
    }
}
