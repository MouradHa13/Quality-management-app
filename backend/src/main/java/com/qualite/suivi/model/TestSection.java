package com.qualite.suivi.model;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class TestSection {
    private String responsable;
    private List<LigneTest> lignes = new ArrayList<>();
}
