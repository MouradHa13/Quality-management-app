package com.qualite.suivi.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "fiches_suivi")
@Data
@EqualsAndHashCode(callSuper = true)
public class FicheSuivi extends AbstractAuditEntity {
    @Id
    private String id;
    private String projetId;
    private String projetNom;
    private Date dateSaisie = new Date();
    private int avancement; // %
    private String problemes;
    private String decisions;
    private String indicateurs;
    private String sujet;
    private String observations;
    private String statut;

    // Signalement
    private String refContractuelle;
    private String demandeur;
    private String natureDemande; // ANOMALIE, AMELIORATION, NOUVEAU_BESOIN
    private String procedureConcernee;
    private String descriptionProbleme;
    private String piecesJointes;
    private String visaRA;

    // Diagnostic
    private Boolean faisabilite;
    private String typeVersion; // VERSION, PATCH
    private String versionCible;
    private String commentaireDiagnostic;
    private String estimationCharge;
    private String estimationDelai;
    private Boolean decisionRMAP;
    private String observationRMAP;
    private Date dateDecisionRMAP;
    private String visaRMAP;

    // Mise à Disposition (MAD) & Dev
    private Boolean madSource;
    private Boolean madExecutable;
    private Boolean madDocumentation;
    private Date dateDemandeMAD;
    private Date dateReceptionMAD;
    private String visaRAMAD;
    private Date dateDemandeEnvDev;
    private Date dateReelleEnvDev;
    private String visaRAEnvDev;

    // Compte Rendu (CR) Travaux & Tests
    private String objetCompteRendu;
    private Boolean comporteSource;
    private Boolean comporteExecutable;
    private Boolean comporteDocumentation;
    private Date dateDemandeEnvTest;
    private Date dateReelleEnvTest;
    private Date dateFinTravaux;
    private String visaRACompteRendu;
    private String visaRMAPCompteRendu;

    // Clôture
    private Date dateEnvoiPackage;
    private String observationCloture;
    private String visaRMAPCloture;

    // Liaison
    private String ficheTestId;
}
