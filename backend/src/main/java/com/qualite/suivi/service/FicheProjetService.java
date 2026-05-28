package com.qualite.suivi.service;

import com.qualite.suivi.model.FicheProjet;
import com.qualite.suivi.model.Projet;
import com.qualite.suivi.repository.FicheProjetRepository;
import com.qualite.suivi.repository.ProjetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class FicheProjetService {

    @Autowired
    private FicheProjetRepository ficheProjetRepository;

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private HistoriqueService historiqueService;

    public FicheProjet submitFiche(String projetId, FicheProjet fiche) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        FicheProjet saved = ficheProjetRepository.save(fiche);

        if (projet.getFichesProjet() == null) projet.setFichesProjet(new ArrayList<>());
        projet.getFichesProjet().add(saved);
        projetRepository.save(projet);

        historiqueService.logAction("FICHE_PROJET", "SUBMIT", "Fiche projet soumise pour le projet: " + projet.getNomProjet());
        return saved;
    }

    public FicheProjet updateFiche(String id, FicheProjet details) {
        FicheProjet fiche = ficheProjetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fiche non trouvée"));

        fiche.setDescription(details.getDescription());
        fiche.setObjectifs(details.getObjectifs());
        fiche.setResponsable(details.getResponsable());
        fiche.setEcheances(details.getEcheances());
        fiche.setStatut(details.getStatut());

        FicheProjet updated = ficheProjetRepository.save(fiche);
        historiqueService.logAction("FICHE_PROJET", "UPDATE", "Fiche projet mise à jour");
        return updated;
    }
}
