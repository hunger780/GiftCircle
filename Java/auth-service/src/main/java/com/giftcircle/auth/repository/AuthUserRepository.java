package com.giftcircle.auth.repository;

import com.giftcircle.auth.model.AuthUser;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface AuthUserRepository extends MongoRepository<AuthUser, String> {
    Optional<AuthUser> findByUsername(String username);
    Optional<AuthUser> findByEmail(String email);
}
