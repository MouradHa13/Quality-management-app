package com.qualite.suivi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "notifications")
@Data
public class Notification {
    @Id
    private String id;
    private String destinataireId;
    private String message;
    private String actionUrl;
    private Date dateEnvoi = new Date();
    private String type; // EMAIL, SMS, INFO, WARNING
    private boolean lu = false;
}
