package com.qualite.suivi.controller;

import com.qualite.suivi.model.FicheProjet;
import com.qualite.suivi.service.FicheProjetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fiches-projet")
public class FicheProjetController {

    @Autowired
    private FicheProjetService ficheProjetService;

    @PostMapping("/{projetId}")
    @PreAuthorize("hasAuthority('CHEF_PROJET')")
    public FicheProjet submitFiche(@PathVariable String projetId, @RequestBody FicheProjet fiche) {
        return ficheProjetService.submitFiche(projetId, fiche);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CHEF_PROJET')")
    public FicheProjet updateFiche(@PathVariable String id, @RequestBody FicheProjet fiche) {
        return ficheProjetService.updateFiche(id, fiche);
    }
}
