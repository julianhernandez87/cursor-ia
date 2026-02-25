package com.demo.integration;

import com.demo.dto.auth.LoginResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT)
@ActiveProfiles("test")
class AuthAndUsersIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void login_thenMe_returnsProfile() {
        ResponseEntity<LoginResponse> loginResp = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("email", "admin@local", "password", "Admin123!"),
                LoginResponse.class);
        assertThat(loginResp.getStatusCode().is2xxSuccessful()).isTrue();
        String token = loginResp.getBody() != null ? loginResp.getBody().getAccessToken() : null;
        assertThat(token).isNotBlank();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        ResponseEntity<Map> meResp = restTemplate.exchange(
                "/api/auth/me",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class);
        assertThat(meResp.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(meResp.getBody()).containsEntry("email", "admin@local");
    }

    @Test
    void login_thenUsers_asAdmin_returns200() {
        ResponseEntity<LoginResponse> loginResp = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("email", "admin@local", "password", "Admin123!"),
                LoginResponse.class);
        String token = loginResp.getBody() != null ? loginResp.getBody().getAccessToken() : null;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        ResponseEntity<String> usersResp = restTemplate.exchange(
                "/api/users",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class);
        assertThat(usersResp.getStatusCode().is2xxSuccessful()).isTrue();
    }

    @Test
    void users_withoutToken_returns401() {
        ResponseEntity<String> resp = restTemplate.getForEntity("/api/users", String.class);
        // Spring Security returns 403 Forbidden when unauthenticated for protected endpoints by default
        assertThat(resp.getStatusCode().value()).isEqualTo(403);
    }
}
