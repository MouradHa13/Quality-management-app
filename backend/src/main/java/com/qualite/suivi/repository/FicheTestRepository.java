package com.qualite.suivi.repository;

import com.qualite.suivi.model.FicheTest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FicheTestRepository extends MongoRepository<FicheTest, String> {
    Optional<FicheTest> findByProjetId(String projetId);
}
