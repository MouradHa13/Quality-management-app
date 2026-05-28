package com.qualite.suivi.controller;

import com.qualite.suivi.model.FicheTest;
import com.qualite.suivi.service.FicheTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fiches-test")
public class FicheTestController {

    @Autowired
    private FicheTestService ficheTestService;

    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'PILOTE_QUALITE', 'ADMIN')")
    public ResponseEntity<FicheTest> getFicheTestByProjetId(@PathVariable String projetId) {
        FicheTest ficheTest = ficheTestService.getFicheTestByProjetId(projetId);
        return ResponseEntity.ok(ficheTest);
    }

    @PostMapping("/projet/{projetId}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'ADMIN')")
    public ResponseEntity<FicheTest> saveFicheTest(@PathVariable String projetId, @RequestBody FicheTest ficheTest) {
        FicheTest savedFicheTest = ficheTestService.saveFicheTest(projetId, ficheTest);
        return ResponseEntity.ok(savedFicheTest);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'ADMIN')")
    public ResponseEntity<Void> deleteFicheTest(@PathVariable String id) {
        ficheTestService.deleteFicheTest(id);
        return ResponseEntity.ok().build();
    }
}
