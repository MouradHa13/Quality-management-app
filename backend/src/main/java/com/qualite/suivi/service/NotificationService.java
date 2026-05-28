package com.qualite.suivi.service;

import com.qualite.suivi.model.Notification;
import com.qualite.suivi.model.Utilisateur;
import com.qualite.suivi.repository.NotificationRepository;
import com.qualite.suivi.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public List<Notification> getNotificationsByDestinataire(String destinataireId) {
        return notificationRepository.findByDestinataireId(destinataireId);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setLu(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead() {
        List<Notification> all = notificationRepository.findAll();
        all.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(all);
    }

    public void deleteNotification(String id) {
        notificationRepository.deleteById(id);
    }

    public void saveNotification(String destinataireId, String message, String type, String actionUrl) {
        Notification n = new Notification();
        n.setDestinataireId(destinataireId);
        n.setMessage(message);
        n.setType(type);
        n.setActionUrl(actionUrl);
        n.setDateEnvoi(new Date());
        n.setLu(false);
        notificationRepository.save(n);
    }

    public void savePublicNotification(Notification notification) {
        notification.setDateEnvoi(new Date());
        notification.setLu(false);
        notificationRepository.save(notification);
    }

    public void notifyAdmins(String message, String type) {
        try {
            System.out.println("DEBUG: Notifying admins with message: " + message);
            
            List<Utilisateur> allUsers = utilisateurRepository.findAll();
            System.out.println("DEBUG: Total users in DB: " + allUsers.size());

            List<Utilisateur> admins = allUsers.stream()
                    .filter(u -> {
                        try {
                            boolean hasAdminRole = u.getRoles() != null && u.getRoles().stream()
                                    .anyMatch(r -> r != null && ("ADMIN".equals(r.getNomRole()) || "ROLE_ADMIN".equals(r.getNomRole())));
                            boolean hasAdminType = "ADMIN".equalsIgnoreCase(u.getType());
                            return hasAdminRole || hasAdminType;
                        } catch (Exception e) {
                            System.out.println("DEBUG: Error checking user " + u.getEmail() + ": " + e.getMessage());
                            return false;
                        }
                    })
                    .toList();
            
            System.out.println("DEBUG: Found " + admins.size() + " admins to notify.");
            admins.forEach(admin -> {
                try {
                    System.out.println("DEBUG: Creating notification for admin: " + admin.getEmail() + " (ID: " + admin.getId() + ")");
                    saveNotification(admin.getId(), message, type, null);
                } catch (Exception e) {
                    System.out.println("DEBUG: Error saving notification for " + admin.getEmail() + ": " + e.getMessage());
                }
            });
        } catch (Exception e) {
            System.out.println("DEBUG: Global error in notifyAdmins: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
