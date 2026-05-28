package com.qualite.suivi.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.Set;

@Document(collection = "utilisateurs")
@Data
@EqualsAndHashCode(callSuper = true)
public class Utilisateur extends AbstractAuditEntity {
    @Id
    private String id;
    private String nom;
    private String prenom;
    @Indexed(unique = true)
    private String email;
    private String motDePasse;
    private boolean actif = false;
    private Date lastSeen;
    private Date dateCreation = new Date();

    @DBRef
    private Set<Role> roles;

    @DBRef
    private Structure structure;

    private String type; // ADMIN, CHEF_PROJET, PILOTE_QUALITE
}
