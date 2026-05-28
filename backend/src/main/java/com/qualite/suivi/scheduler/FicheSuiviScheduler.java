package com.qualite.suivi.scheduler;

import com.qualite.suivi.model.FicheSuivi;
import com.qualite.suivi.model.Projet;
import com.qualite.suivi.repository.ProjetRepository;
import com.qualite.suivi.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
public class FicheSuiviScheduler {

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private NotificationService notificationService;



    // Run every day at 8 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void checkMissingFiches() {
        List<Projet> projets = projetRepository.findAll();
        Date now = new Date();

        for (Projet projet : projets) {
            if (projet.getFichesSuivi() == null || projet.getFichesSuivi().isEmpty()) {
                notifyLate(projet);
                continue;
            }

            // Check the last FicheSuivi date
            FicheSuivi lastFiche = projet.getFichesSuivi().get(projet.getFichesSuivi().size() - 1);
            long diffInMillies = Math.abs(now.getTime() - lastFiche.getDateSaisie().getTime());
            long diffInDays = TimeUnit.DAYS.convert(diffInMillies, TimeUnit.MILLISECONDS);

            if (diffInDays > 7) { // Example: more than a week since last update
                notifyLate(projet);
            }
        }
    }

    private void notifyLate(Projet projet) {
        if (projet.getChefDeProjet() == null) return;

        String message = "Rappel: La fiche de suivi pour le projet '" + projet.getNomProjet() + "' est en retard.";
        notificationService.saveNotification(projet.getChefDeProjet().getId(), message, "WARNING", null);
        // notificationService.sendSMS("+1234567890", message, projet.getChefDeProjet().getId()); // Mock SMS
    }
}
