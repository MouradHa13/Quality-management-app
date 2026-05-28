package com.qualite.suivi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "historique")
@Data
public class Historique {
    @Id
    private String id;
    private String entiteConcernee;
    private String action; // CREATE, UPDATE, DELETE
    private String auteur;
    private Date dateModification = new Date();
    private String details;
}
