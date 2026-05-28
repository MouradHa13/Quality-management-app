package com.qualite.suivi.repository;

import com.qualite.suivi.model.FicheProjet;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FicheProjetRepository extends MongoRepository<FicheProjet, String> {
}
