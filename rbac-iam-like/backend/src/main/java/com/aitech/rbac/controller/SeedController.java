package com.aitech.rbac.controller;

import com.aitech.rbac.mapper.UserMapper;
import com.aitech.rbac.model.User;
import com.github.javafaker.Faker;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/seed")
public class SeedController {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final Faker faker = new Faker();

    public SeedController(UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/users")
    public ResponseEntity<String> seedUsers(@RequestParam(defaultValue = "1000") int count) {

        CompletableFuture.runAsync(() -> {
            System.out.println("Starting seeding of " + count + " users...");
            String defaultPassword = passwordEncoder.encode("password123");

            // Batch insert would be better but simple loop for now
            // Or generate list and insert? Mapper usually insert one by one.
            for (int i = 0; i < count; i++) {
                User u = new User();
                u.setUserId(UUID.randomUUID());
                String firstName = faker.name().firstName();
                String lastName = faker.name().lastName();
                u.setUsername((firstName + "." + lastName + i).toLowerCase());
                u.setEmail(firstName.toLowerCase() + "." + lastName.toLowerCase() + i + "@example.com");
                u.setPasswordHash(defaultPassword); // Same password for speed
                u.setActive(true);
                u.setCreatedAt(LocalDateTime.now());
                u.setUpdatedAt(LocalDateTime.now());

                try {
                    userMapper.insert(u);
                } catch (Exception e) {
                    // Ignore dups
                }

                if (i % 100 == 0) {
                    System.out.println("Seeded " + i + " users...");
                }
            }
            System.out.println("Seeding completed.");
        });

        return ResponseEntity.ok("Seeding process started in background for " + count + " users.");
    }
}
