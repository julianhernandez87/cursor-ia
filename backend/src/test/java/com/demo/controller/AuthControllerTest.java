package com.demo.controller;

import com.demo.config.SecurityConfig;
import com.demo.dto.auth.LoginRequest;
import com.demo.dto.auth.LoginResponse;
import com.demo.dto.auth.RegisterRequestDto;
import com.demo.dto.auth.UserProfileDto;
import com.demo.dto.user.UserResponseDto;
import com.demo.entity.DocumentType;
import com.demo.security.AppUserDetailsService;
import com.demo.service.AuthService;
import com.demo.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@Import({ SecurityConfig.class, com.demo.security.JwtAuthenticationFilter.class })
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private AuthService authService;
    @MockBean
    private JwtService jwtService;
    @MockBean
    private AppUserDetailsService appUserDetailsService;

    @Test
    void login_validRequest_returnsToken() throws Exception {
        LoginRequest request = new LoginRequest("admin@local", "Admin123!");
        when(authService.login("admin@local", "Admin123!"))
                .thenReturn(new LoginResponse("jwt-token", "Bearer", 3600));

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresInSeconds").value(3600));
    }

    @Test
    @WithMockUser(username = "admin@local")
    void me_authenticated_returnsProfile() throws Exception {
        when(authService.getProfileByUsername("admin@local"))
                .thenReturn(new UserProfileDto(1L, "Admin", null, null, "admin@local", null, true, null, null, Set.of("ADMIN")));

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@local"))
                .andExpect(jsonPath("$.roles").isArray());
    }

    @Test
    void register_validRequest_returns201() throws Exception {
        RegisterRequestDto request = new RegisterRequestDto();
        request.setFullName("Maria Lopez");
        request.setDocumentType(DocumentType.CC);
        request.setDocumentNumber("11223344");
        request.setEmail("maria@example.com");
        request.setPhone("+5711122233");
        request.setPassword("SecurePass1");
        request.setConfirmPassword("SecurePass1");

        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setId(10L);
        responseDto.setFullName("Maria Lopez");
        responseDto.setEmail("maria@example.com");
        responseDto.setEnabled(true);
        responseDto.setRoles(Set.of("USER"));

        when(authService.register(org.mockito.ArgumentMatchers.any(RegisterRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.email").value("maria@example.com"))
                .andExpect(jsonPath("$.fullName").value("Maria Lopez"))
                .andExpect(jsonPath("$.roles").isArray());
    }

    @Test
    void register_duplicateEmail_returns409() throws Exception {
        RegisterRequestDto request = new RegisterRequestDto();
        request.setFullName("Maria Lopez");
        request.setDocumentType(DocumentType.CC);
        request.setDocumentNumber("11223344");
        request.setEmail("existing@example.com");
        request.setPassword("SecurePass1");
        request.setConfirmPassword("SecurePass1");

        when(authService.register(org.mockito.ArgumentMatchers.any(RegisterRequestDto.class)))
                .thenThrow(new com.demo.exception.DuplicateEmailException("Email already registered: existing@example.com"));

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email already registered: existing@example.com"));
    }
}
