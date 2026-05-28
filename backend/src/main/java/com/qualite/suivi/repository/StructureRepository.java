package com.qualite.suivi.repository;

import com.qualite.suivi.model.Structure;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface StructureRepository extends MongoRepository<Structure, String> {
    List<Structure> findByTypeStructure(String typeStructure);
}
