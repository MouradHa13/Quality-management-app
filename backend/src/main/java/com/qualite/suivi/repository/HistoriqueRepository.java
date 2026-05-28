package com.qualite.suivi.repository;

import com.qualite.suivi.model.Historique;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface HistoriqueRepository extends MongoRepository<Historique, String> {
    List<Historique> findByEntiteConcernee(String entiteConcernee);
}
