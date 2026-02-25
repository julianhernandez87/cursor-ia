package com.demo.service;

import com.demo.dto.user.UserCreateDto;
import com.demo.dto.user.UserResponseDto;
import com.demo.dto.user.UserUpdateDto;
import com.demo.entity.RoleEntity;
import com.demo.entity.UserEntity;
import com.demo.exception.DuplicateEmailException;
import com.demo.exception.ResourceNotFoundException;
import com.demo.repository.RoleRepository;
import com.demo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private UserService userService;

    @Test
    void create_hashesPassword_andDoesNotExposeInResponse() {
        when(userRepository.existsByEmail("u@e.com")).thenReturn(false);
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(new RoleEntity(1L, "USER")));
        when(passwordEncoder.encode("plain")).thenReturn("hashed");
        UserEntity saved = new UserEntity();
        saved.setId(2L);
        saved.setEmail("u@e.com");
        saved.setPasswordHash("hashed");
        saved.setEnabled(true);
        saved.setRoles(Set.of(new RoleEntity(1L, "USER")));
        when(userRepository.save(any(UserEntity.class))).thenReturn(saved);

        UserCreateDto dto = new UserCreateDto("u@e.com", "plain", Set.of("USER"));
        UserResponseDto response = userService.create(dto);

        assertThat(response.getEmail()).isEqualTo("u@e.com");
        assertThat(response.getRoles()).contains("USER");
        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPasswordHash()).isEqualTo("hashed");
    }

    @Test
    void create_duplicateEmail_throws() {
        when(userRepository.existsByEmail("u@e.com")).thenReturn(true);
        UserCreateDto dto = new UserCreateDto("u@e.com", "pass", Set.of("USER"));

        assertThatThrownBy(() -> userService.create(dto))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessageContaining("Email already in use");
    }

    @Test
    void findById_notFound_throws() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void update_changesEmailAndRoles() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setEmail("old@e.com");
        user.setEnabled(true);
        user.setRoles(Set.of(new RoleEntity(1L, "USER")));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("new@e.com")).thenReturn(false);
        when(roleRepository.findByName("ADMIN")).thenReturn(Optional.of(new RoleEntity(2L, "ADMIN")));
        when(userRepository.save(any(UserEntity.class))).thenAnswer(i -> i.getArgument(0));

        UserUpdateDto dto = new UserUpdateDto("new@e.com", true, Set.of("ADMIN"));
        UserResponseDto response = userService.update(1L, dto);

        assertThat(response.getEmail()).isEqualTo("new@e.com");
        assertThat(response.getRoles()).contains("ADMIN");
    }
}
