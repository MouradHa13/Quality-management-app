package com.qualite.suivi.service;

import com.qualite.suivi.model.FicheSuivi;
import com.qualite.suivi.model.Projet;
import com.qualite.suivi.repository.FicheSuiviRepository;
import com.qualite.suivi.repository.ProjetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class FicheSuiviService {

    @Autowired
    private FicheSuiviRepository ficheSuiviRepository;

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private HistoriqueService historiqueService;

    public FicheSuivi addFicheSuivi(String projetId, FicheSuivi fiche) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        fiche.setDateSaisie(new Date());
        fiche.setProjetId(projet.getId());
        fiche.setProjetNom(projet.getNomProjet());

        // Backwards compatibility mapper
        if (fiche.getDescriptionProbleme() != null && fiche.getProblemes() == null) {
            fiche.setProblemes(fiche.getDescriptionProbleme());
        } else if (fiche.getProblemes() != null && fiche.getDescriptionProbleme() == null) {
            fiche.setDescriptionProbleme(fiche.getProblemes());
        }

        if (fiche.getCommentaireDiagnostic() != null && fiche.getDecisions() == null) {
            fiche.setDecisions(fiche.getCommentaireDiagnostic());
        } else if (fiche.getDecisions() != null && fiche.getCommentaireDiagnostic() == null) {
            fiche.setCommentaireDiagnostic(fiche.getDecisions());
        }

        if (fiche.getObjetCompteRendu() != null && fiche.getSujet() == null) {
            fiche.setSujet(fiche.getObjetCompteRendu());
        } else if (fiche.getSujet() != null && fiche.getObjetCompteRendu() == null) {
            fiche.setObjetCompteRendu(fiche.getSujet());
        }

        FicheSuivi saved = ficheSuiviRepository.save(fiche);

        if (projet.getFichesSuivi() == null) projet.setFichesSuivi(new ArrayList<>());
        projet.getFichesSuivi().add(saved);
        
        projetRepository.save(projet);
        updateProjetAverageAvancement(projet);

        historiqueService.logAction("FICHE_SUIVI", "CREATE", "Fiche suivi ajoutée pour le projet: " + projet.getNomProjet());
        return saved;
    }

    public List<FicheSuivi> getFichesSuiviByProjet(String projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        return projet.getFichesSuivi() != null ? projet.getFichesSuivi() : new ArrayList<>();
    }

    public List<FicheSuivi> getAllFichesSuivi() {
        return ficheSuiviRepository.findAll();
    }

    public FicheSuivi updateFicheSuivi(String id, FicheSuivi details) {
        FicheSuivi fiche = ficheSuiviRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fiche non trouvée"));
        
        fiche.setAvancement(details.getAvancement());
        fiche.setProblemes(details.getProblemes());
        fiche.setDecisions(details.getDecisions());
        fiche.setIndicateurs(details.getIndicateurs());
        fiche.setSujet(details.getSujet());
        fiche.setObservations(details.getObservations());
        fiche.setStatut(details.getStatut());

        // Signalement
        fiche.setRefContractuelle(details.getRefContractuelle());
        fiche.setDemandeur(details.getDemandeur());
        fiche.setNatureDemande(details.getNatureDemande());
        fiche.setProcedureConcernee(details.getProcedureConcernee());
        fiche.setDescriptionProbleme(details.getDescriptionProbleme() != null ? details.getDescriptionProbleme() : details.getProblemes());
        fiche.setPiecesJointes(details.getPiecesJointes());
        fiche.setVisaRA(details.getVisaRA());

        // Diagnostic
        fiche.setFaisabilite(details.getFaisabilite());
        fiche.setTypeVersion(details.getTypeVersion());
        fiche.setVersionCible(details.getVersionCible());
        fiche.setCommentaireDiagnostic(details.getCommentaireDiagnostic() != null ? details.getCommentaireDiagnostic() : details.getDecisions());
        fiche.setEstimationCharge(details.getEstimationCharge());
        fiche.setEstimationDelai(details.getEstimationDelai());
        fiche.setDecisionRMAP(details.getDecisionRMAP());
        fiche.setObservationRMAP(details.getObservationRMAP() != null ? details.getObservationRMAP() : details.getObservations());
        fiche.setDateDecisionRMAP(details.getDateDecisionRMAP());
        fiche.setVisaRMAP(details.getVisaRMAP());

        // Mise à disposition
        fiche.setMadSource(details.getMadSource());
        fiche.setMadExecutable(details.getMadExecutable());
        fiche.setMadDocumentation(details.getMadDocumentation());
        fiche.setDateDemandeMAD(details.getDateDemandeMAD());
        fiche.setDateReceptionMAD(details.getDateReceptionMAD());
        fiche.setVisaRAMAD(details.getVisaRAMAD());
        fiche.setDateDemandeEnvDev(details.getDateDemandeEnvDev());
        fiche.setDateReelleEnvDev(details.getDateReelleEnvDev());
        fiche.setVisaRAEnvDev(details.getVisaRAEnvDev());

        // Compte Rendu
        fiche.setObjetCompteRendu(details.getObjetCompteRendu() != null ? details.getObjetCompteRendu() : details.getSujet());
        fiche.setComporteSource(details.getComporteSource());
        fiche.setComporteExecutable(details.getComporteExecutable());
        fiche.setComporteDocumentation(details.getComporteDocumentation());
        fiche.setDateDemandeEnvTest(details.getDateDemandeEnvTest());
        fiche.setDateReelleEnvTest(details.getDateReelleEnvTest());
        fiche.setDateFinTravaux(details.getDateFinTravaux());
        fiche.setVisaRACompteRendu(details.getVisaRACompteRendu());
        fiche.setVisaRMAPCompteRendu(details.getVisaRMAPCompteRendu());

        // Clôture
        fiche.setDateEnvoiPackage(details.getDateEnvoiPackage());
        fiche.setObservationCloture(details.getObservationCloture());
        fiche.setVisaRMAPCloture(details.getVisaRMAPCloture());

        // Liaison
        fiche.setFicheTestId(details.getFicheTestId());

        // Backwards compatibility sync
        if (fiche.getDescriptionProbleme() != null) {
            fiche.setProblemes(fiche.getDescriptionProbleme());
        }
        if (fiche.getCommentaireDiagnostic() != null) {
            fiche.setDecisions(fiche.getCommentaireDiagnostic());
        }
        if (fiche.getObjetCompteRendu() != null) {
            fiche.setSujet(fiche.getObjetCompteRendu());
        }

        FicheSuivi updated = ficheSuiviRepository.save(fiche);

        if (updated.getProjetId() != null) {
            projetRepository.findById(updated.getProjetId()).ifPresent(this::updateProjetAverageAvancement);
        }

        historiqueService.logAction("FICHE_SUIVI", "UPDATE", "Fiche suivi mise à jour pour le projet: " + updated.getProjetNom());
        return updated;
    }

    public void deleteFicheSuivi(String id) {
        FicheSuivi fiche = ficheSuiviRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fiche non trouvée"));
        
        Projet projet = projetRepository.findById(fiche.getProjetId()).orElse(null);
        if (projet != null && projet.getFichesSuivi() != null) {
            projet.getFichesSuivi().removeIf(f -> f.getId().equals(id));
            projetRepository.save(projet);
            updateProjetAverageAvancement(projet);
        }

        ficheSuiviRepository.deleteById(id);
        historiqueService.logAction("FICHE_SUIVI", "DELETE", "Fiche suivi supprimée pour le projet: " + fiche.getProjetNom());
    }

    private void updateProjetAverageAvancement(Projet projet) {
        if (projet == null) return;
        List<FicheSuivi> fiches = projet.getFichesSuivi();
        if (fiches == null || fiches.isEmpty()) {
            return; 
        }
        
        int total = 0;
        for (FicheSuivi f : fiches) {
            total += f.getAvancement();
        }
        int avg = total / fiches.size();
        System.out.println("DEBUG - Autocalculating project " + projet.getNomProjet() + " avancement to " + avg + "% based on " + fiches.size() + " fiches.");
        projet.setAvancement(avg);
        projetRepository.save(projet);
    }
}
