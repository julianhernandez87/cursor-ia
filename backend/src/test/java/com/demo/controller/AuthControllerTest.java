package com.demo.controller;

import com.demo.config.SecurityConfig;
import com.demo.dto.auth.LoginRequest;
import com.demo.dto.auth.LoginResponse;
import com.demo.dto.auth.UserProfileDto;
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
                .thenReturn(new UserProfileDto(1L, "admin@local", Set.of("ADMIN")));

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@local"))
                .andExpect(jsonPath("$.roles").isArray());
    }
}
