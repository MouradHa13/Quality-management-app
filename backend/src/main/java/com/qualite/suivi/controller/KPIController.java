package com.qualite.suivi.controller;

import com.qualite.suivi.model.KPI;
import com.qualite.suivi.service.KPIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/kpis")
public class KPIController {

    @Autowired
    private KPIService kpiService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PILOTE_QUALITE', 'ADMIN')")
    public List<KPI> getAllKPIs() {
        return kpiService.getAllKPIs();
    }

    @PostMapping("/calculate")
    @PreAuthorize("hasAuthority('PILOTE_QUALITE')")
    public KPI calculateKPI(@RequestParam String name, @RequestParam String formula, @RequestParam String period) {
        return kpiService.calculateKPI(name, formula, period);
    }

    @GetMapping("/export/pdf")
    @PreAuthorize("hasAuthority('PILOTE_QUALITE')")
    public ResponseEntity<InputStreamResource> exportPDF() {
        ByteArrayInputStream bis = kpiService.exportToPDF();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=kpi_report.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/export/excel")
    @PreAuthorize("hasAuthority('PILOTE_QUALITE')")
    public ResponseEntity<InputStreamResource> exportExcel() {
        ByteArrayInputStream bis = kpiService.exportToExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=kpi_report.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(bis));
    }
}
