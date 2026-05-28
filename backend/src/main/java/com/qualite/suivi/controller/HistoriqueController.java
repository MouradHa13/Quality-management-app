package com.qualite.suivi.controller;

import com.qualite.suivi.model.Historique;
import com.qualite.suivi.service.HistoriqueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historique")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HistoriqueController {

    @Autowired
    private HistoriqueService historiqueService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE')")
    public List<Historique> getAllHistorique() {
        return historiqueService.getAllHistorique();
    }

    @GetMapping("/entite/{entite}")
    public List<Historique> getHistoriqueByEntite(@PathVariable String entite) {
        return historiqueService.getHistoriqueByEntite(entite);
    }
}
