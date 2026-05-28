package com.qualite.suivi.service;

import com.qualite.suivi.model.Structure;
import com.qualite.suivi.repository.StructureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NomenclatureService {

    @Autowired
    private StructureRepository structureRepository;

    public List<Structure> getAllNomenclatures() {
        return structureRepository.findAll();
    }

    public List<Structure> getNomenclaturesByType(String type) {
        return structureRepository.findByTypeStructure(type);
    }

    public Structure createNomenclature(Structure s) {
        return structureRepository.save(s);
    }

    public void deleteNomenclature(String id) {
        structureRepository.deleteById(id);
    }

    public Structure updateNomenclature(String id, Structure details) {
        Structure s = structureRepository.findById(id).orElseThrow();
        s.setNomStructure(details.getNomStructure());
        s.setTypeStructure(details.getTypeStructure());
        s.setDescription(details.getDescription());
        return structureRepository.save(s);
    }
}
