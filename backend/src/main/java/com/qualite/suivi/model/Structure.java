package com.qualite.suivi.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "structures")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Structure {
    @Id
    private String id;
    private String nomStructure;
    private String typeStructure; // Nomenclature type
    private String description;
}
