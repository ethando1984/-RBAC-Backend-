package com.hemera.cms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@org.mybatis.spring.annotation.MapperScan("com.hemera.cms.mapper")
public class HemeraBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(HemeraBackendApplication.class, args);
    }
}
