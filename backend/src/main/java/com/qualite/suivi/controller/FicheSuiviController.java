package com.qualite.suivi.controller;

import com.qualite.suivi.model.FicheSuivi;
import com.qualite.suivi.service.FicheSuiviService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fiches-suivi")
public class FicheSuiviController {

    @Autowired
    private FicheSuiviService ficheSuiviService;

    @PostMapping("/{projetId}")
    @PreAuthorize("hasAuthority('CHEF_PROJET')")
    public FicheSuivi addFicheSuivi(@PathVariable String projetId, @RequestBody FicheSuivi fiche) {
        return ficheSuiviService.addFicheSuivi(projetId, fiche);
    }

    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'PILOTE_QUALITE', 'ADMIN')")
    public List<FicheSuivi> getFichesSuiviByProjet(@PathVariable String projetId) {
        return ficheSuiviService.getFichesSuiviByProjet(projetId);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PILOTE_QUALITE', 'CHEF_PROJET')")
    public List<FicheSuivi> getAllFichesSuivi() {
        return ficheSuiviService.getAllFichesSuivi();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'ADMIN')")
    public FicheSuivi updateFicheSuivi(@PathVariable String id, @RequestBody FicheSuivi fiche) {
        return ficheSuiviService.updateFicheSuivi(id, fiche);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'ADMIN')")
    public ResponseEntity<Void> deleteFicheSuivi(@PathVariable String id) {
        ficheSuiviService.deleteFicheSuivi(id);
        return ResponseEntity.ok().build();
    }
}
