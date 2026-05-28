package com.qualite.suivi.repository;

import com.qualite.suivi.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByDestinataireId(String destinataireId);
}
