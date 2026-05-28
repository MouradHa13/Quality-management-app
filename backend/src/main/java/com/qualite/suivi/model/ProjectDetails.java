package com.qualite.suivi.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProjectDetails {
    // Identification
    private String designationClient;
    private String cadreContractuel;
    private String caractereProjet; // National, Communal, CNI
    private String typeProjet; // Nouveau, Evolution, Refonte

    // Content
    private String presentation;
    private String historique;
    private String perimetre;

    // Organisation
    private String maitreOuvrage;
    private String maitreOeuvre;
    private List<String> equipeProjet;

    // Estimations
    private List<EstimationCharge> estimationCharges;
    private List<EstimationBudget> estimationBudgets;

    // Planning & Final
    private String delaisPrevisionnels;
    private String risquesPotentiels;
    private String preRequis;
    private List<PlanningAction> planningActions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EstimationCharge {
        private String prestation;
        private String profil;
        private String periode;
        private String chargeHM;
        private String livrables;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EstimationBudget {
        private String profil;
        private String chargeProfil;
        private String budget;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PlanningAction {
        private String action;
        private String profil;
        private String chargeHM;
        private List<Integer> mois; // List of months (e.g. [1, 2, 5]) where action happens
    }
}
