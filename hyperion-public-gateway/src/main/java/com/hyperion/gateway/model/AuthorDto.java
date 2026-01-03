package com.hyperion.gateway.model;

import lombok.Data;

@Data
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class AuthorDto {
    private String name;
    private String bio;
    private String avatarUrl;
}
