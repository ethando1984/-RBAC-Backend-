package com.aitech.rbac.service;

import com.aitech.rbac.mapper.UserMapper;
import com.aitech.rbac.model.User;
import com.aitech.rbac.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserServiceImplTest {

    @Mock
    private UserMapper mapper;

    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private UserServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new UserServiceImpl(mapper, passwordEncoder);
    }

    @Test
    void getAllDelegatesToMapper() {
        List<User> users = List.of(new User());
        when(mapper.findAll(null)).thenReturn(users);

        List<User> result = service.getAll();

        assertEquals(users, result);
        verify(mapper).findAll(null);
    }

    @Test
    void getByIdDelegatesToMapper() {
        UUID id = UUID.randomUUID();
        User user = new User();
        when(mapper.findById(id)).thenReturn(user);

        User result = service.getById(id);

        assertEquals(user, result);
        verify(mapper).findById(id);
    }

    @Test
    void createDelegatesToMapper() {
        User user = new User();

        service.create(user);

        verify(mapper).insert(user);
    }

    @Test
    void updateDelegatesToMapper() {
        User user = new User();

        service.update(user);

        verify(mapper).update(user);
    }

    @Test
    void deleteDelegatesToMapper() {
        UUID id = UUID.randomUUID();

        service.delete(id);

        verify(mapper).delete(id);
    }
}
