package com.qualite.suivi.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Date;
import java.util.List;

@Document(collection = "projets")
@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class Projet extends AbstractAuditEntity {
    @Id
    private String id;
    private String nomProjet;
    private String description;
    private String objectifs;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private Date dateDebut;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private Date dateFinPrevue;
    private String statut; // from nomenclature

    @DBRef
    private Utilisateur chefDeProjet;

    @DBRef
    private List<FicheProjet> fichesProjet;

    @DBRef
    private List<FicheSuivi> fichesSuivi;

    @DBRef
    private FicheTest ficheTest; // One FicheTest per Projet as requested

    @DBRef
    private List<KPI> kpis;

    private Integer avancement; // %
    private Integer kpiGlobal;

    private ProjectDetails details;
}
