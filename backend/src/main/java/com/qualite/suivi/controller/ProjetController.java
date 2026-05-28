package com.qualite.suivi.controller;

import com.qualite.suivi.model.Projet;
import com.qualite.suivi.model.Utilisateur;
import com.qualite.suivi.service.ProjetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projets")
public class ProjetController {

    @Autowired
    private ProjetService projetService;

    @Autowired
    private com.qualite.suivi.repository.UtilisateurRepository utilisateurRepository;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'PILOTE_QUALITE', 'ADMIN')")
    public List<Projet> getAllProjets() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        
        boolean isAdminOrPilot = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN") || 
                             a.getAuthority().equals("PILOTE_QUALITE") || 
                             a.getAuthority().equals("ROLE_ADMIN") || 
                             a.getAuthority().equals("ROLE_PILOTE_QUALITE"));
        
        if (isAdminOrPilot) {
            return projetService.getAllProjets();
        } else {
            String email = auth.getName();
            Utilisateur user = utilisateurRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + email));
            return projetService.getProjetsByChef(user.getId());
        }
    }

    @GetMapping("/chef/{chefId}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'ADMIN')")
    public List<Projet> getProjetsByChef(@PathVariable String chefId) {
        return projetService.getProjetsByChef(chefId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CHEF_PROJET')")
    public Projet createProjet(@RequestBody Projet projet) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Utilisateur currentChef = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + email));
        projet.setChefDeProjet(currentChef);
        return projetService.createProjet(projet);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'PILOTE_QUALITE', 'ADMIN')")
    public Projet getProjet(@PathVariable String id) {
        return projetService.getProjetById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'ADMIN')")
    public Projet updateProjet(@PathVariable String id, @RequestBody Projet projet) {
        return projetService.updateProjet(id, projet);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'ADMIN')")
    public ResponseEntity<?> deleteProjet(@PathVariable String id) {
        projetService.deleteProjet(id);
        return ResponseEntity.ok().build();
    }
}
