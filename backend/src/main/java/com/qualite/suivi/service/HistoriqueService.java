package com.qualite.suivi.service;

import com.qualite.suivi.model.Historique;
import com.qualite.suivi.repository.HistoriqueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class HistoriqueService {

    @Autowired
    private HistoriqueRepository historiqueRepository;

    public void logAction(String entite, String action, String details) {
        Historique h = new Historique();
        h.setEntiteConcernee(entite);
        h.setAction(action);
        h.setDetails(details);
        h.setAuteur(SecurityContextHolder.getContext().getAuthentication().getName());
        h.setDateModification(new Date());
        historiqueRepository.save(h);
    }

    public List<Historique> getHistoriqueByEntite(String entite) {
        return historiqueRepository.findByEntiteConcernee(entite);
    }

    public List<Historique> getAllHistorique() {
        return historiqueRepository.findAll();
    }
}
