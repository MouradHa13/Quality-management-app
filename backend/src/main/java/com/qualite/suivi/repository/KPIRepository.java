package com.qualite.suivi.repository;

//import com.qualite.suivi.model.KPIData; // renamed to keep it clean if needed, but let's stick to KPI
import com.qualite.suivi.model.KPI;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface KPIRepository extends MongoRepository<KPI, String> {
}
