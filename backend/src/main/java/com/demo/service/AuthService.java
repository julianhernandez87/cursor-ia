package com.demo.service;

import com.demo.dto.auth.LoginResponse;
import com.demo.dto.auth.RegisterRequestDto;
import com.demo.dto.auth.UserProfileDto;
import com.demo.dto.user.UserResponseDto;
import com.demo.entity.DocumentType;
import com.demo.entity.RoleEntity;
import com.demo.entity.UserEntity;
import com.demo.exception.DuplicateDocumentException;
import com.demo.exception.DuplicateEmailException;
import com.demo.exception.ResourceNotFoundException;
import com.demo.repository.RoleRepository;
import com.demo.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
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

    @Transactional
    public UserResponseDto register(RegisterRequestDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateEmailException("Email already registered: " + dto.getEmail());
        }
        if (userRepository.existsByDocumentNumber(dto.getDocumentNumber())) {
            throw new DuplicateDocumentException("Document number already registered");
        }
        UserEntity user = new UserEntity();
        user.setFullName(dto.getFullName());
        user.setDocumentType(dto.getDocumentType());
        user.setDocumentNumber(dto.getDocumentNumber());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone() != null && !dto.getPhone().isBlank() ? dto.getPhone() : null);
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setEnabled(true);
        user.setRoles(resolveUserRole());
        user = userRepository.save(user);
        return toUserResponse(user);
    }

    private Set<RoleEntity> resolveUserRole() {
        RoleEntity userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(new RoleEntity(null, "USER")));
        Set<RoleEntity> roles = new HashSet<>();
        roles.add(userRole);
        return roles;
    }

    private UserResponseDto toUserResponse(UserEntity user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setDocumentType(user.getDocumentType());
        dto.setDocumentNumber(user.getDocumentNumber());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setEnabled(user.getEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setRoles(user.getRoles().stream().map(RoleEntity::getName).collect(Collectors.toSet()));
        return dto;
    }

    public UserProfileDto toProfile(UserEntity user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setDocumentType(user.getDocumentType());
        dto.setDocumentNumber(user.getDocumentNumber());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setEnabled(user.getEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setRoles(user.getRoles().stream().map(RoleEntity::getName).collect(Collectors.toSet()));
        return dto;
    }
}
