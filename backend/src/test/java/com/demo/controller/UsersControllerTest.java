package com.demo.controller;

import com.demo.config.SecurityConfig;
import com.demo.dto.user.UserCreateDto;
import com.demo.dto.user.UserResponseDto;
import com.demo.dto.user.UserUpdateDto;
import com.demo.security.AppUserDetailsService;
import com.demo.service.JwtService;
import com.demo.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UsersController.class)
@Import({ SecurityConfig.class, com.demo.security.JwtAuthenticationFilter.class })
class UsersControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private UserService userService;
    @MockBean
    private JwtService jwtService;
    @MockBean
    private AppUserDetailsService appUserDetailsService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void list_returnsUsers() throws Exception {
        when(userService.findAll()).thenReturn(List.of(
                new UserResponseDto(1L, null, null, null, "admin@local", null, true, null, null, Set.of("ADMIN"))));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("admin@local"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void list_withoutAdmin_returns403() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void create_returns201() throws Exception {
        UserCreateDto dto = new UserCreateDto("u@e.com", "password1", Set.of("USER"));
        when(userService.create(any(UserCreateDto.class)))
                .thenReturn(new UserResponseDto(2L, null, null, null, "u@e.com", null, true, null, null, Set.of("USER")));

        mockMvc.perform(post("/api/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("u@e.com"));
        verify(userService).create(any(UserCreateDto.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void update_returnsOk() throws Exception {
        UserUpdateDto dto = new UserUpdateDto("updated@e.com", true, Set.of("ADMIN"));
        when(userService.update(eq(1L), any(UserUpdateDto.class)))
                .thenReturn(new UserResponseDto(1L, null, null, null, "updated@e.com", null, true, null, null, Set.of("ADMIN")));

        mockMvc.perform(put("/api/users/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("updated@e.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void delete_returns204() throws Exception {
        mockMvc.perform(delete("/api/users/1").with(csrf()))
                .andExpect(status().isNoContent());
        verify(userService).deleteById(1L);
    }
}
