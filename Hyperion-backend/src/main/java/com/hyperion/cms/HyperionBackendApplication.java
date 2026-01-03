package com.hyperion.cms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@org.mybatis.spring.annotation.MapperScan({ "com.hyperion.cms.mapper", "com.hyperion.cms.royalty.mapper" })
public class HyperionBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(HyperionBackendApplication.class, args);
    }
}
