package com.qualite.suivi.service;

import com.qualite.suivi.model.FicheTest;
import com.qualite.suivi.model.Projet;
import com.qualite.suivi.repository.FicheTestRepository;
import com.qualite.suivi.repository.ProjetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FicheTestService {

    @Autowired
    private FicheTestRepository ficheTestRepository;

    @Autowired
    private ProjetRepository projetRepository;

    public FicheTest getFicheTestByProjetId(String projetId) {
        return ficheTestRepository.findByProjetId(projetId).orElse(null);
    }

    public FicheTest saveFicheTest(String projetId, FicheTest ficheTest) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé: " + projetId));
        
        // If a FicheTest already exists for this project, update it instead of creating a new one
        Optional<FicheTest> existingFicheTest = ficheTestRepository.findByProjetId(projetId);
        if (existingFicheTest.isPresent()) {
            ficheTest.setId(existingFicheTest.get().getId());
        }
        
        ficheTest.setProjet(projet);
        FicheTest savedFicheTest = ficheTestRepository.save(ficheTest);
        
        // Update the project's reference to this FicheTest
        projet.setFicheTest(savedFicheTest);
        projetRepository.save(projet);
        
        return savedFicheTest;
    }

    public void deleteFicheTest(String id) {
        FicheTest ficheTest = ficheTestRepository.findById(id).orElse(null);
        if (ficheTest != null) {
            Projet projet = ficheTest.getProjet();
            if (projet != null) {
                projet.setFicheTest(null);
                projetRepository.save(projet);
            }
            ficheTestRepository.deleteById(id);
        }
    }
}
