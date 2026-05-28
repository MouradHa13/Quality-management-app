package com.qualite.suivi.repository;

import com.qualite.suivi.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface RoleRepository extends MongoRepository<Role, String> {
    Optional<Role> findByNomRole(String nomRole);
}
