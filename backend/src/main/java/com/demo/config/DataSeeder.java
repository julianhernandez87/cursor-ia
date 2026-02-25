package com.demo.config;

import com.demo.entity.DocumentType;
import com.demo.entity.RoleEntity;
import com.demo.entity.UserEntity;
import com.demo.repository.RoleRepository;
import com.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    @Profile("!test")
    public CommandLineRunner seedData(RoleRepository roleRepository,
                                      UserRepository userRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            RoleEntity userRole = roleRepository.findByName("USER")
                    .orElseGet(() -> roleRepository.save(new RoleEntity(null, "USER")));
            RoleEntity adminRole = roleRepository.findByName("ADMIN")
                    .orElseGet(() -> roleRepository.save(new RoleEntity(null, "ADMIN")));

            if (userRepository.findByEmail("admin@local").isEmpty()) {
                UserEntity admin = new UserEntity();
                admin.setFullName("Admin");
                admin.setDocumentType(DocumentType.CC);
                admin.setDocumentNumber("ADMIN-SEED");
                admin.setEmail("admin@local");
                admin.setPhone(null);
                admin.setPasswordHash(passwordEncoder.encode("Admin123!"));
                admin.setEnabled(true);
                admin.getRoles().add(adminRole);
                userRepository.save(admin);
            }
        };
    }
}
