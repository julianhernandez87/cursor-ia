package com.demo.dto.user;

import com.demo.entity.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {

    private Long id;
    private String fullName;
    private DocumentType documentType;
    private String documentNumber;
    private String email;
    private String phone;
    private Boolean enabled;
    private Instant createdAt;
    private Instant updatedAt;
    private Set<String> roles;
}
