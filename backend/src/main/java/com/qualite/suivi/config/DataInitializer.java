package com.qualite.suivi.config;

import com.qualite.suivi.model.Projet;
import com.qualite.suivi.model.Role;
import com.qualite.suivi.model.Utilisateur;
import com.qualite.suivi.model.FicheSuivi;
import com.qualite.suivi.model.Notification;
import com.qualite.suivi.repository.ProjetRepository;
import com.qualite.suivi.repository.RoleRepository;
import com.qualite.suivi.repository.UtilisateurRepository;
import com.qualite.suivi.repository.FicheSuiviRepository;
import com.qualite.suivi.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private FicheSuiviRepository ficheSuiviRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        Role roleAdmin = ensureRole("ADMIN", Arrays.asList("ALL"));
        Role roleChef = ensureRole("CHEF_PROJET", Arrays.asList("READ", "WRITE_PROJET"));
        Role rolePilote = ensureRole("PILOTE_QUALITE", Arrays.asList("READ", "VALIDATE_QUALITE"));

        System.out.println("Roles verified/seeded successfully!");

        // Seed Users UNIQUEMENT si la base est vide (premier démarrage)
        Utilisateur admin, chef1, chef2, chef3, pilote1, pilote2, pilote3;
        if (utilisateurRepository.count() == 0) {
            System.out.println("Base vide - Création des utilisateurs par défaut...");
            admin   = ensureUser("Admin Tunisie", "admin@tunisie-qualite.tn", "admin123", "ADMIN", Set.of(roleAdmin));
            chef1   = ensureUser("Amine Trabelsi", "amine.trabelsi@tunisie-qualite.tn", "chef123", "CHEF_PROJET", Set.of(roleChef));
            chef2   = ensureUser("Leila Gharbi", "leila.gharbi@tunisie-qualite.tn", "chef123", "CHEF_PROJET", Set.of(roleChef));
            chef3   = ensureUser("Youssef Msakni", "youssef.msakni@tunisie-qualite.tn", "chef123", "CHEF_PROJET", Set.of(roleChef));
            pilote1 = ensureUser("Fatma Ben Ali", "fatma.benali@tunisie-qualite.tn", "pilote123", "PILOTE_QUALITE", Set.of(rolePilote));
            pilote2 = ensureUser("Samir Bouazizi", "samir.bouazizi@tunisie-qualite.tn", "pilote123", "PILOTE_QUALITE", Set.of(rolePilote));
            pilote3 = ensureUser("Rim Karray", "rim.karray@tunisie-qualite.tn", "pilote123", "PILOTE_QUALITE", Set.of(rolePilote));
            System.out.println("Utilisateurs créés avec succès!");
        } else {
            System.out.println("Des utilisateurs existent déjà - Seeding ignoré pour préserver les données.");
            // Récupérer les utilisateurs existants pour les notifications
            admin   = utilisateurRepository.findByEmail("admin@tunisie-qualite.tn").orElse(null);
            chef1   = utilisateurRepository.findByEmail("amine.trabelsi@tunisie-qualite.tn").orElse(null);
            chef2   = utilisateurRepository.findByEmail("leila.gharbi@tunisie-qualite.tn").orElse(null);
            chef3   = utilisateurRepository.findByEmail("youssef.msakni@tunisie-qualite.tn").orElse(null);
            pilote1 = utilisateurRepository.findByEmail("fatma.benali@tunisie-qualite.tn").orElse(null);
            pilote2 = utilisateurRepository.findByEmail("samir.bouazizi@tunisie-qualite.tn").orElse(null);
            pilote3 = utilisateurRepository.findByEmail("rim.karray@tunisie-qualite.tn").orElse(null);
        }

        // Seed Projects AND Fiches
        /* 
        if (projetRepository.count() == 0 || ficheSuiviRepository.count() == 0) {
            seedProjectsWithFiches(chef1, chef2, chef3);
            System.out.println("12 Tunisian Projects and their Fiches de Suivi seeded successfully!");
        } else {
            System.out.println("Database already contains projects and fiches. Skipping seed.");
            // One-time migration for existing data
            migrateFichesSuivi();
        }
        */
        System.out.println("Automatic seeding of projects disabled to allow manual management.");

        // Seed Notifications (uniquement si les utilisateurs de référence existent)
        if (notificationRepository.count() == 0 && pilote1 != null && chef1 != null) {
            seedNotifications(pilote1.getId(), chef1.getId());
            System.out.println("Sample notifications seeded!");
        } else if (pilote1 == null || chef1 == null) {
            System.out.println("Utilisateurs de référence introuvables - Seeding notifications ignoré.");
        }
    }

    private void migrateFichesSuivi() {
        List<Projet> allProjets = projetRepository.findAll();
        for (Projet p : allProjets) {
            if (p.getFichesSuivi() != null) {
                for (FicheSuivi f : p.getFichesSuivi()) {
                    if (f.getProjetId() == null) {
                        f.setProjetId(p.getId());
                        f.setProjetNom(p.getNomProjet());
                        ficheSuiviRepository.save(f);
                    }
                }
            }
        }
        System.out.println("Migration of FicheSuivi projet fields completed.");
    }

    private void seedNotifications(String piloteId, String chefId) {
        List<Notification> notifications = new ArrayList<>();

        String[][] data = {
            { chefId, "Le projet 'Certification ISO 9001 - Sfax' a atteint 85% d'avancement.", "INFO" },
            { piloteId, "⚠️ Le projet 'Formation Auditeurs Internes - Sousse' est EN RETARD. Action requise.", "WARNING" },
            { piloteId, "Nouvelle fiche de suivi soumise pour le projet 'Déploiement Lean - Bizerte'.", "INFO" },
            { chefId, "Rappel : L'audit blanc du projet ISO 9001 est prévu le 15 avril 2025.", "INFO" },
            { piloteId, "Le score de conformité moyen mensuel est de 78%. Objectif : 85%.", "WARNING" },
            { piloteId, "Le projet 'Audit Qualité Fournisseurs - Rades' est officiellement TERMINÉ. 🎉", "INFO" }
        };

        for (String[] d : data) {
            Notification n = new Notification();
            n.setDestinataireId(d[0]);
            n.setMessage(d[1]);
            n.setType(d[2]);
            n.setDateEnvoi(new Date());
            n.setLu(false);
            notifications.add(n);
        }

        notificationRepository.saveAll(notifications);
    }

    private Role ensureRole(String nom, List<String> perms) {
        Role role = roleRepository.findByNomRole(nom).orElse(new Role());
        role.setNomRole(nom);
        role.setPermissions(perms);
        return roleRepository.save(role);
    }

    private Utilisateur ensureUser(String nom, String email, String password, String type, Set<Role> roles) {
        if (!utilisateurRepository.existsByEmail(email)) {
            Utilisateur u = new Utilisateur();
            u.setNom(nom);
            u.setEmail(email);
            u.setMotDePasse(passwordEncoder.encode(password));
            u.setType(type);
            u.setRoles(roles);
            return utilisateurRepository.save(u);
        }
        return utilisateurRepository.findByEmail(email).get();
    }

    private void seedProjectsWithFiches(Utilisateur chef1, Utilisateur chef2, Utilisateur chef3) {
        List<Projet> projets = new ArrayList<>();

        projets.add(createProjetWithFiche("Certification ISO 9001 - Site Industriel Sfax", 
            "Démarche de certification ISO 9001 pour l'usine principale de Sfax.", "Obtenir la certification avant Q3", chef1, 85, "EN COURS",
            "Indicateurs au vert (KPI Qualité: 92%)", "Besoin de finaliser le manuel qualité", "Audit blanc prévu le 15 avril"));
        
        projets.add(createProjetWithFiche("Déploiement Lean Manufacturing - Bizerte", 
            "Optimisation des temps de cycle dans les chaînes de production.", "Réduction de 20% du gaspillage", chef2, 40, "EN COURS",
            "Économie d'énergie de 12%", "Résistance au changement sur la zone A", "Session de sensibilisation KAIZEN"));
        
        projets.add(createProjetWithFiche("Audit Qualité Fournisseurs - Rades", 
            "Évaluation triennale des prestataires logistiques au port de Rades.", "Mise à jour de 100% des dossiers fournisseurs", chef3, 100, "TERMINÉ",
            "100% conformité logistique", "Zéro incident signalé", "Clôture du dossier d'audit annuel"));

        projets.add(createProjetWithFiche("Mise à niveau QSE - Pôle Technologique El Ghazala", 
            "Alignement sur les normes de cybersécurité et qualité des services IT.", "Zéro non-conformité majeure d'ici 2025", chef1, 20, "EN COURS",
            "Analyse des risques terminée", "Infrastructure réseau à mettre niveau", "Achat de nouveaux firewalls"));

        projets.add(createProjetWithFiche("Digitalisation Processus Qualité - Tunis", 
            "Basculement vers la plateforme TextQualite pour toutes les agences.", "Déploiement sur 15 sites", chef2, 60, "EN COURS",
            "8/15 sites en production", "Retards sur la formation utilisateur", "Mise en place de tutoriels vidéo"));

        projets.add(createProjetWithFiche("Formation Auditeurs Internes - Sousse", 
            "Plan de renforcement des capacités pour 50 collaborateurs.", "50 certifiés ICA", chef3, 10, "EN RETARD",
            "Sessions théoriques validées", "Manque de formateurs certifiés", "Recrutement d'un consultant externe"));

        projets.add(createProjetWithFiche("Intégration Norme ISO 14001 - Pôle Chimique Gabès", 
            "Mise en place d'un SME pour réduire l'impact écologique local.", "Réduction des émissions de 15%", chef1, 75, "EN COURS",
            "Étude d'impact validée", "Équipements de mesure défaillants", "Maintenance d'urgence programmée"));

        projets.add(createProjetWithFiche("Suivi Non-Conformités 2024 - Djerba", 
            "Analyse et traitement des réclamations clients du pôle touristique.", "Amélioration de satisfaction client (CSAT) > 90%", chef2, 90, "EN COURS",
            "92% de résolution", "Complexité de certains dossiers", "Assigner un référent senior"));

        projets.add(createProjetWithFiche("Amélioration Continue KAIZEN - Monastir", 
            "Ateliers participatifs pour les ouvriers du textile.", "10 projets d'amélioration par an", chef3, 100, "TERMINÉ",
            "Culture qualité ancrée", "Excellentes suggestions ouvrières", "Récompense de l'équipe 혁신 (Innovation)"));

        projets.add(createProjetWithFiche("Certification HACCP - Agroalimentaire Nabeul", 
            "Garantie de la sécurité alimentaire pour l'exportation.", "Obtenir agrément sanitaire européen", chef1, 5, "EN ATTENTE",
            "Dossier technique déposé", "Exigence ISO 22000 additionnelle", "Étude de faisabilité"));

        projets.add(createProjetWithFiche("Réduction Taux Rebut - Usine Câblage Béja", 
            "Méthode 6 Sigma pour diminuer les défauts de fabrication de câbles auto.", "Passer de 3% à 0.5% de rebuts", chef2, 35, "EN COURS",
            "Taux descendu à 2.1%", "Surchauffe ponctuelle machine B4", "Installation circuit refroidissement"));

        projets.add(createProjetWithFiche("Mise en place SMQ - Laboratoire d'Analyses Ariana", 
            "Standardisation des protocoles d'analyse médicale.", "Accréditation ISO 15189", chef3, 50, "EN COURS",
            "Vérification des pipettes ok", "Documentation incomplète", "Rédaction intensive des procédures"));
            
        System.out.println("All seeded projects and fiches saved.");
    }

    private Projet createProjetWithFiche(String nom, String desc, String objectifs, Utilisateur chef, int avancement, String statut, 
                                        String ind, String prob, String dec) {
        Projet p = new Projet();
        p.setNomProjet(nom);
        p.setDescription(desc);
        p.setObjectifs(objectifs);
        p.setChefDeProjet(chef);
        p.setAvancement(avancement);
        p.setStatut(statut);
        
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.MONTH, - (int)(Math.random() * 6));
        p.setDateDebut(cal.getTime());
        
        cal.add(Calendar.MONTH, (int)(Math.random() * 12) + 1);
        p.setDateFinPrevue(cal.getTime());
        
        // Save Projet first to generate its MongoDB ObjectID
        p = projetRepository.save(p);

        // Create FicheSuivi with projet references
        FicheSuivi f = new FicheSuivi();
        f.setAvancement(avancement);
        f.setIndicateurs(ind);
        f.setProblemes(prob);
        f.setDecisions(dec);
        f.setDateSaisie(new Date());
        f.setProjetId(p.getId());
        f.setProjetNom(p.getNomProjet());
        FicheSuivi savedF = ficheSuiviRepository.save(f);

        p.setFichesSuivi(new ArrayList<>(List.of(savedF)));
        
        return projetRepository.save(p);
    }
}
