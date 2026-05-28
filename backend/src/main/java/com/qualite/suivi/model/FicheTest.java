package com.qualite.suivi.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Date;

@Document(collection = "fiches_test")
@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class FicheTest extends AbstractAuditEntity {
    @Id
    private String id;
    
    // Entête
    private String application;
    private String version;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date dateVersion;
    
    private String architecture; // "Client/serveur" ou "3-tiers"
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date dateDemandeEnvTest;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date dateNoteServiceAffectation;

    // Corps (Les Tests)
    private TestSection testFonctionnel = new TestSection();
    private TestSection testSecurite = new TestSection();
    private TestSection testQualite = new TestSection();

    // Clôture
    private String responsableValidation; // RA:
    private String signatureResponsable;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date dateValidation;

    @DBRef
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Projet projet;
}
