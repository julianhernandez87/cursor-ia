package com.demo.service;

import com.demo.dto.auth.LoginResponse;
import com.demo.dto.auth.UserProfileDto;
import com.demo.entity.UserEntity;
import com.demo.exception.ResourceNotFoundException;
import com.demo.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(String email, String password) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!user.getEnabled()) {
            throw new BadCredentialsException("Account disabled");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        String token = jwtService.sign(user.getEmail(), user.getEmail());
        return new LoginResponse(token, "Bearer", jwtService.getExpirationSeconds());
    }

    /**
     * Loads profile by username (email). Used by /me; keeps repository access in service layer.
     */
    public UserProfileDto getProfileByUsername(String username) {
        UserEntity user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return toProfile(user);
    }

    public UserProfileDto toProfile(UserEntity user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRoles(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet()));
        return dto;
    }
}
