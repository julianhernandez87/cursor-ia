package com.demo.service;

import com.demo.dto.auth.LoginResponse;
import com.demo.dto.auth.RegisterRequestDto;
import com.demo.dto.user.UserResponseDto;
import com.demo.entity.DocumentType;
import com.demo.entity.RoleEntity;
import com.demo.entity.UserEntity;
import com.demo.exception.DuplicateDocumentException;
import com.demo.exception.DuplicateEmailException;
import com.demo.repository.RoleRepository;
import com.demo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
    private RoleRepository roleRepository;
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

    @Test
    void register_success_returnsUserResponseDto() {
        RegisterRequestDto dto = new RegisterRequestDto();
        dto.setFullName("Juan Pérez");
        dto.setDocumentType(DocumentType.CC);
        dto.setDocumentNumber("12345678");
        dto.setEmail("juan@example.com");
        dto.setPhone("+5712345678");
        dto.setPassword("Pass1234");
        dto.setConfirmPassword("Pass1234");

        when(userRepository.existsByEmail("juan@example.com")).thenReturn(false);
        when(userRepository.existsByDocumentNumber("12345678")).thenReturn(false);
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(new RoleEntity(1L, "USER")));
        when(passwordEncoder.encode("Pass1234")).thenReturn("encoded");

        UserEntity saved = new UserEntity();
        saved.setId(2L);
        saved.setFullName("Juan Pérez");
        saved.setEmail("juan@example.com");
        saved.setEnabled(true);
        saved.setRoles(Set.of(new RoleEntity(1L, "USER")));
        when(userRepository.save(org.mockito.ArgumentMatchers.any(UserEntity.class))).thenReturn(saved);

        UserResponseDto result = authService.register(dto);

        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getEmail()).isEqualTo("juan@example.com");
        assertThat(result.getFullName()).isEqualTo("Juan Pérez");
        assertThat(result.getEnabled()).isTrue();
        assertThat(result.getRoles()).contains("USER");

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getDocumentNumber()).isEqualTo("12345678");
        assertThat(captor.getValue().getPasswordHash()).isEqualTo("encoded");
    }

    @Test
    void register_duplicateEmail_throwsDuplicateEmailException() {
        RegisterRequestDto dto = new RegisterRequestDto();
        dto.setFullName("Juan Pérez");
        dto.setDocumentType(DocumentType.CC);
        dto.setDocumentNumber("12345678");
        dto.setEmail("existing@example.com");
        dto.setPassword("Pass1234");
        dto.setConfirmPassword("Pass1234");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(dto))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessageContaining("existing@example.com");
    }

    @Test
    void register_duplicateDocumentNumber_throwsDuplicateDocumentException() {
        RegisterRequestDto dto = new RegisterRequestDto();
        dto.setFullName("Juan Pérez");
        dto.setDocumentType(DocumentType.CC);
        dto.setDocumentNumber("87654321");
        dto.setEmail("new@example.com");
        dto.setPassword("Pass1234");
        dto.setConfirmPassword("Pass1234");

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.existsByDocumentNumber("87654321")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(dto))
                .isInstanceOf(DuplicateDocumentException.class)
                .hasMessageContaining("Document number already registered");
    }
}
