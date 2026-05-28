package com.qualite.suivi.repository;

import com.qualite.suivi.model.FicheSuivi;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FicheSuiviRepository extends MongoRepository<FicheSuivi, String> {
}
