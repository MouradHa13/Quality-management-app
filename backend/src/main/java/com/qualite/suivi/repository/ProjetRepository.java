package com.qualite.suivi.repository;

import com.qualite.suivi.model.Projet;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProjetRepository extends MongoRepository<Projet, String> {
    List<Projet> findByChefDeProjetId(String chefDeProjetId);
    List<Projet> findByChefDeProjetIdOrChefDeProjetIsNull(String chefDeProjetId);
}
