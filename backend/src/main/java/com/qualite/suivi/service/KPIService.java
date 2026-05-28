package com.qualite.suivi.service;

import com.qualite.suivi.model.KPI;
import com.qualite.suivi.model.Projet;
import com.qualite.suivi.repository.KPIRepository;
import com.qualite.suivi.repository.ProjetRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class KPIService {

    @Autowired
    private KPIRepository kpiRepository;

    @Autowired
    private ProjetRepository projetRepository;

    public List<KPI> getAllKPIs() {
        return kpiRepository.findAll();
    }

    public KPI calculateKPI(String name, String formula, String period) {
        // Mock calculation logic for the demo
        KPI kpi = new KPI();
        kpi.setNomIndicateur(name);
        kpi.setFormule(formula);
        kpi.setPeriode(period);
        kpi.setValeur((float) (Math.random() * 100));
        return kpiRepository.save(kpi);
    }

    public ByteArrayInputStream exportToPDF() {
        List<KPI> kpis = kpiRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("Rapport des Indicateurs de Performance (KPI)"));

            Table table = new Table(4);
            table.addCell("Indicateur");
            table.addCell("Formule");
            table.addCell("Période");
            table.addCell("Valeur");

            for (KPI kpi : kpis) {
                table.addCell(kpi.getNomIndicateur());
                table.addCell(kpi.getFormule());
                table.addCell(kpi.getPeriode());
                table.addCell(String.valueOf(kpi.getValeur()));
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream exportToExcel() {
        List<KPI> kpis = kpiRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("KPIs");

            Row headerRow = sheet.createRow(0);
            String[] columns = {"Indicateur", "Formule", "Période", "Valeur"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            int rowIdx = 1;
            for (KPI kpi : kpis) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(kpi.getNomIndicateur());
                row.createCell(1).setCellValue(kpi.getFormule());
                row.createCell(2).setCellValue(kpi.getPeriode());
                row.createCell(3).setCellValue(kpi.getValeur());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
