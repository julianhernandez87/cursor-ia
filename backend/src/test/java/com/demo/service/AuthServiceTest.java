package com.demo.service;

import com.demo.dto.auth.LoginResponse;
import com.demo.entity.RoleEntity;
import com.demo.entity.UserEntity;
import com.demo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @InjectMocks
    private AuthService authService;

    @Test
    void login_success_returnsToken() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setEmail("admin@local");
        user.setPasswordHash("hash");
        user.setEnabled(true);
        user.setRoles(Set.of(new RoleEntity(1L, "ADMIN")));
        when(userRepository.findByEmail("admin@local")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Admin123!", "hash")).thenReturn(true);
        when(jwtService.sign("admin@local", "admin@local")).thenReturn("jwt-token");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);

        LoginResponse response = authService.login("admin@local", "Admin123!");

        assertThat(response.getAccessToken()).isEqualTo("jwt-token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getExpiresInSeconds()).isEqualTo(3600L);
        verify(jwtService).sign("admin@local", "admin@local");
    }

    @Test
    void login_wrongPassword_throwsBadCredentials() {
        UserEntity user = new UserEntity();
        user.setEmail("admin@local");
        user.setPasswordHash("hash");
        user.setEnabled(true);
        when(userRepository.findByEmail("admin@local")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThatThrownBy(() -> authService.login("admin@local", "wrong"))
                .isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void login_userNotFound_throwsBadCredentials() {
        when(userRepository.findByEmail("unknown@local")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login("unknown@local", "pass"))
                .isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class);
    }
}
