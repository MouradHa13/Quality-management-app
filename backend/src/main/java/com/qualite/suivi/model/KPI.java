package com.qualite.suivi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "kpis")
@Data
public class KPI {
    @Id
    private String id;
    private String nomIndicateur;
    private String formule;
    private String periode;
    private float valeur;
}
