package com.qualite.suivi.controller;

import com.qualite.suivi.model.Structure;
import com.qualite.suivi.service.NomenclatureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nomenclatures")
public class NomenclatureController {

    @Autowired
    private NomenclatureService nomenclatureService;

    @GetMapping
    public List<Structure> getAll() {
        return nomenclatureService.getAllNomenclatures();
    }

    @GetMapping("/type/{type}")
    public List<Structure> getByType(@PathVariable String type) {
        return nomenclatureService.getNomenclaturesByType(type);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public Structure create(@RequestBody Structure s) {
        return nomenclatureService.createNomenclature(s);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public Structure create(@PathVariable String id, @RequestBody Structure s) {
        return nomenclatureService.updateNomenclature(id ,s);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void delete(@PathVariable String id) {
        nomenclatureService.deleteNomenclature(id);
    }
}
