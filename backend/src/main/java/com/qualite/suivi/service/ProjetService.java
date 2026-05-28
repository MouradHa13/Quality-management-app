package com.qualite.suivi.service;

import com.qualite.suivi.model.Projet;
import com.qualite.suivi.model.Utilisateur;
import com.qualite.suivi.repository.ProjetRepository;
import com.qualite.suivi.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjetService {

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private HistoriqueService historiqueService;

    public Projet createProjet(Projet projet) {
        if (projet.getChefDeProjet() != null && projet.getChefDeProjet().getId() != null) {
            Utilisateur chef = utilisateurRepository.findById(projet.getChefDeProjet().getId())
                    .orElseThrow(() -> new RuntimeException("Chef de projet non trouvé"));
            projet.setChefDeProjet(chef);
        }
        Projet saved = projetRepository.save(projet);
        historiqueService.logAction("PROJET", "CREATE", "Projet créé: " + saved.getNomProjet());
        return saved;
    }

    public Projet updateProjet(String id, Projet projetDetails) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        projet.setNomProjet(projetDetails.getNomProjet());
        projet.setDescription(projetDetails.getDescription());
        projet.setObjectifs(projetDetails.getObjectifs());
        projet.setDateDebut(projetDetails.getDateDebut());
        projet.setDateFinPrevue(projetDetails.getDateFinPrevue());
        projet.setStatut(projetDetails.getStatut());
        projet.setAvancement(projetDetails.getAvancement()); // ← Fix: was missing!
        projet.setDetails(projetDetails.getDetails());

        if (projetDetails.getChefDeProjet() != null && projetDetails.getChefDeProjet().getId() != null) {
            Utilisateur chef = utilisateurRepository.findById(projetDetails.getChefDeProjet().getId())
                    .orElseThrow(() -> new RuntimeException("Chef de projet non trouvé"));
            projet.setChefDeProjet(chef);
        }

        Projet updated = projetRepository.save(projet);
        historiqueService.logAction("PROJET", "UPDATE", "Projet mis à jour: " + updated.getNomProjet());
        return updated;
    }

    public List<Projet> getAllProjets() {
        return projetRepository.findAll();
    }

    public List<Projet> getProjetsByChef(String chefId) {
        return projetRepository.findByChefDeProjetIdOrChefDeProjetIsNull(chefId);
    }

    public Projet getProjetById(String id) {
        return projetRepository.findById(id).orElseThrow(() -> new RuntimeException("Projet non trouvé"));
    }

    public void deleteProjet(String id) {
        Projet p = getProjetById(id);
        projetRepository.deleteById(id);
        historiqueService.logAction("PROJET", "DELETE", "Projet supprimé: " + p.getNomProjet());
    }
}
