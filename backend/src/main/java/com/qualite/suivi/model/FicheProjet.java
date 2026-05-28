package com.qualite.suivi.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "fiches_projet")
@Data
@EqualsAndHashCode(callSuper = true)
public class FicheProjet extends AbstractAuditEntity {
    @Id
    private String id;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private Date dateCreation = new Date();
    private String responsableId; // ID of the responsible person
    private List<String> documents; // Path or names of documents

    // Additional fields from Cahier des Charges
    private String nomProjet;
    private String description;
    private String objectifs;
    private String responsable;
    private String echeances;
    private String statut;
}
