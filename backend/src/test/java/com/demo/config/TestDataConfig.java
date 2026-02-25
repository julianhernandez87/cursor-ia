package com.demo.config;

import com.demo.entity.RoleEntity;
import com.demo.entity.UserEntity;
import com.demo.repository.RoleRepository;
import com.demo.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("test")
public class TestDataConfig {

    @Bean
    public ApplicationRunner testDataRunner(RoleRepository roleRepository,
                                            UserRepository userRepository,
                                            PasswordEncoder passwordEncoder) {
        return args -> {
            RoleEntity adminRole = roleRepository.findByName("ADMIN")
                    .orElseGet(() -> roleRepository.save(new RoleEntity(null, "ADMIN")));
            RoleEntity userRole = roleRepository.findByName("USER")
                    .orElseGet(() -> roleRepository.save(new RoleEntity(null, "USER")));
            if (userRepository.findByEmail("admin@local").isEmpty()) {
                UserEntity admin = new UserEntity();
                admin.setEmail("admin@local");
                admin.setPasswordHash(passwordEncoder.encode("Admin123!"));
                admin.setEnabled(true);
                admin.getRoles().add(adminRole);
                userRepository.save(admin);
            }
        };
    }
}
