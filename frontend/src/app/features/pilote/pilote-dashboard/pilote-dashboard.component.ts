import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { KpiService } from '../../../services/kpi.service';
import { FicheService } from '../../../services/fiche.service';
import { ProjetService } from '../../../services/projet.service';
import { NotificationService } from '../../../services/notification.service';
import { GlobalStats, KPI } from '../../../models/kpi.model';

@Component({
  selector: 'app-pilote-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './pilote-dashboard.component.html',
  styleUrls: ['./pilote-dashboard.component.css']
})
export class PiloteDashboardComponent implements OnInit {
  kpiService = inject(KpiService);
  ficheService = inject(FicheService);
  projetService = inject(ProjetService);
  notificationService = inject(NotificationService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);

  stats: GlobalStats | null = null;
  fiches: any[] = [];
  periodeFilter = 30; // jours
  
  // Charts Configurations
  public chartOptions = { responsive: true, maintainAspectRatio: false };
  public lineChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [{ data: [65, 59, 80, 81, 56, 55], label: 'Taux avancement global', borderColor: '#14b8a6', tension: 0.4 }]
  };
  
  public doughnutChartData = {
    labels: ['En cours', 'Terminés', 'En retard'],
    datasets: [{ data: [15, 45, 10], backgroundColor: ['#3b82f6', '#10b981', '#ef4444'] }]
  };

  public barChartData = {
    labels: ['Projet A', 'Projet B', 'Projet C', 'Projet D'],
    datasets: [{ data: [12, 19, 3, 5], label: 'Non-conformités', backgroundColor: '#a855f7' }]
  };

  ngOnInit() {
    this.refreshData();
    // Auto-refresh every 60s
    setInterval(() => this.refreshData(false), 60000);
  }

  formatNumber(value: number | null | undefined, decimals: number = 2): string {
    if (value === null || value === undefined) return '0.00';
    return parseFloat(value.toString()).toFixed(decimals);
  }

  refreshData(showSpinner = true) {
    if (showSpinner) this.spinner.show();
    
    this.kpiService.getGlobalStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loadFiches();
        this.loadDoughnutChart();
        if (showSpinner) this.spinner.hide();
      },
      error: () => {
        if (showSpinner) this.spinner.hide();
      }
    });

    this.kpiService.getAll().subscribe({
      next: (kpis: KPI[]) => {
        // Map true data to charts in a complete implementation
      }
    });
  }

loadFiches() {
  this.ficheService.getAllFichesSuivi().subscribe({
    next: (res: any[]) => this.fiches = (res || []).filter(f => f != null)
  });
}

  loadDoughnutChart() {
    this.projetService.getAll().subscribe({
      next: (projets) => {
        const enCours = projets.filter(p => !p.statut || p.statut === 'EN_COURS' || p.statut === 'NOUVEAU').length;
        const termines = projets.filter(p => p.statut === 'TERMINE').length;
        const enRetard = projets.filter(p => p.statut === 'EN_RETARD').length;

        this.doughnutChartData = {
          ...this.doughnutChartData,
          datasets: [{ ...this.doughnutChartData.datasets[0], data: [enCours, termines, enRetard] }]
        };

        const projectNames = projets.slice(0, 4).map(p => p.nomProjet);
        const randomAnomalies = projectNames.map(() => Math.floor(Math.random() * 10)); // simulated
        if (projectNames.length > 0) {
          this.barChartData = {
            ...this.barChartData,
            labels: projectNames,
            datasets: [{ ...this.barChartData.datasets[0], data: randomAnomalies, label: 'Non-conformités par Projet' }]
          };
        }
      }
    });
  }

  async exporterPdf() {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const today = new Date().toLocaleDateString('fr-TN');
    const title = 'Rapport KPI & Suivi Qualité';

    // Header
    doc.setFillColor(15, 118, 110);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 16);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le : ${today}`, 14, 23);

    // Stats
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Indicateurs Globaux', 14, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (this.stats) {
      const statsLines = [
        `• Projets en retard : ${this.stats.projetsEnRetard}`,
        `• Taux de complétion moyen : ${Math.round(this.stats.tauxCompletionMoyen)}%`,
        `• KPI global : ${this.stats.kpiGlobalMoyen} pts`,
        `• Notifications envoyées : ${this.stats.notificationsEnvoyees}`,
      ];
      let y = 48;
      statsLines.forEach(line => { doc.text(line, 14, y); y += 7; });
    }

    // Table header
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des Fiches de Suivi', 14, 82);
    const headers = ['#', 'Sujet', 'Responsable', 'Statut', 'Avancement'];
    const colWidths = [15, 65, 45, 35, 26];
    let startX = 14;
    let startY = 90;

    doc.setFillColor(15, 118, 110);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    headers.forEach((h, i) => {
      doc.rect(startX, startY - 5, colWidths[i], 8, 'F');
      doc.text(h, startX + 2, startY);
      startX += colWidths[i];
    });

    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    let rowY = startY + 5;
    this.fiches.slice(0, 25).forEach((f, idx) => {
      const bg = idx % 2 === 0 ? [245, 245, 245] : [255, 255, 255];
      doc.setFillColor(bg[0], bg[1], bg[2]);
      let rx = 14;
      [String(idx + 1), f.ficheProjet?.contenu?.substring(0, 30) || 'N/A',
       f.responsableAction ? `${f.responsableAction.prenom} ${f.responsableAction.nom}` : 'Non assigné',
       (f.statutAction || 'N/A').replace('_', ' '),
       `${f.tauxAvancement || 0}%`
      ].forEach((cell, ci) => {
        doc.rect(rx, rowY - 4, colWidths[ci], 7, 'F');
        doc.text(String(cell).substring(0, 28), rx + 2, rowY);
        rx += colWidths[ci];
      });
      rowY += 7;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('TextQualite Suivi App — Confidentiel', 14, 285);
    doc.text(`Page 1`, 195, 285, { align: 'right' });

    doc.save(`rapport_kpi_${today.replace(/\//g, '-')}.pdf`);
  }

  async exporterExcel() {
    const XLSX = await import('xlsx');
    const today = new Date().toLocaleDateString('fr-TN');

    // Sheet 1 — Stats
    const statsData = this.stats ? [
      ['Rapport KPI & Suivi Qualité — TextQualite'],
      [`Généré le : ${today}`],
      [],
      ['Indicateur', 'Valeur'],
      ['Projets en retard', this.stats.projetsEnRetard],
      ['Taux complétion moyen (%)', this.formatNumber(this.stats.tauxCompletionMoyen)],
      ['KPI global moyen (pts)', this.formatNumber(this.stats.kpiGlobalMoyen)],
      ['Notifications envoyées', this.stats.notificationsEnvoyees],
      ['Total projets', this.stats.totalProjets],
      ['Total fiches', this.stats.totalFiches],
    ] : [['Aucune donnée']];

    // Sheet 2 — Fiches
    const fichesData = [
      ['#', 'Sujet / Contenu', 'Projet', 'Responsable', 'Statut', 'Avancement (%)'],
      ...this.fiches.map((f, i) => [
        i + 1,
        f.ficheProjet?.contenu || 'N/A',
        f.ficheProjet?.projet?.nom || f.projetNom || 'N/A',
        f.responsableAction ? `${f.responsableAction.prenom} ${f.responsableAction.nom}` : 'Non assigné',
        (f.statutAction || 'N/A').replace('_', ' '),
        f.tauxAvancement || 0
      ])
    ];

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(statsData);
    const ws2 = XLSX.utils.aoa_to_sheet(fichesData);

    // Column widths
    ws1['!cols'] = [{ wch: 35 }, { wch: 20 }];
    ws2['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 25 }, { wch: 25 }, { wch: 18 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, ws1, 'Indicateurs KPI');
    XLSX.utils.book_append_sheet(wb, ws2, 'Fiches de Suivi');

    XLSX.writeFile(wb, `rapport_kpi_${today.replace(/\//g, '-')}.xlsx`);
  }


  notifierRetard(fiche: any) {
    if (!fiche.responsableAction) return;
    this.notificationService.envoyerNotification(fiche.responsableAction.id, `Retard signalé sur la fiche ${fiche.id}`, 'RETARD')
      .subscribe({
        next: () => this.toastr.success('Notification de retard envoyée avec succès.')
      });
  }
}
