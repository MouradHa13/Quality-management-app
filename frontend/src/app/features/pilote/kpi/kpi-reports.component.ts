import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiService } from '../../../services/kpi.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';

interface KpiStats {
  totalProjets: number;
  projetsEnCours: number;
  projetsTermines: number;
  projetsEnRetard: number;
  avancementMoyen: number;
  totalFiches: number;
}

@Component({
  selector: 'app-kpi-reports',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './kpi-reports.component.html',
  styleUrls: ['./kpi-reports.component.css']
})
export class KpiReportsComponent implements OnInit {
  private kpiService = inject(KpiService);
  toastr = inject(ToastrService);

  @ViewChild('dashboardContent') dashboardContent!: ElementRef;

  stats: KpiStats = {
    totalProjets: 0,
    projetsEnCours: 0,
    projetsTermines: 0,
    projetsEnRetard: 0,
    avancementMoyen: 0,
    totalFiches: 0
  };

  isLoading  = true;
  isExporting = false;
  downloadingExcel = false;

  ngOnInit() {
    this.kpiService.getGlobalStats().subscribe({
      next: (globalStats) => {
        this.stats.totalProjets    = globalStats.totalProjets;
        this.stats.totalFiches     = globalStats.totalFiches;
        this.stats.avancementMoyen = Math.round(globalStats.tauxCompletionMoyen);
        this.stats.projetsEnRetard = globalStats.projetsEnRetard;
        this.stats.projetsEnCours  = globalStats.totalProjets - globalStats.projetsEnRetard - this.stats.projetsTermines;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  downloadPdf() {
    this.isExporting = true;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W   = doc.internal.pageSize.getWidth();   // 210
    const H   = doc.internal.pageSize.getHeight();  // 297
    const M   = 15; // margin
    const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

    // ── helpers ────────────────────────────────────────────────────────────
    const rgb = (hex: string): [number, number, number] => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
    const fill  = (hex: string) => doc.setFillColor(...rgb(hex));
    const draw  = (hex: string) => doc.setDrawColor(...rgb(hex));
    const color = (hex: string) => doc.setTextColor(...rgb(hex));
    const rr = (x: number, y: number, w: number, h: number, r: number, s: 'F'|'S'|'FD' = 'F') =>
      doc.roundedRect(x, y, w, h, r, r, s);

    // ── 1. HEADER ─────────────────────────────────────────────────────────
    fill('#1E3A5F');
    doc.rect(0, 0, W, 44, 'F');
    fill('#3B82F6');
    doc.rect(0, 41, W, 3, 'F');

    // Logo box
    fill('#3B82F6');
    rr(M, 8, 26, 26, 3);
    color('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('TEXT',    M + 13, 19, { align: 'center' });
    doc.text('QUALITÉ', M + 13, 26, { align: 'center' });

    // Title
    color('#FFFFFF');
    doc.setFontSize(17);
    doc.text('Rapport KPI & Performance SMQ', M + 32, 19);
    color('#93C5FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Tableau de bord qualité  ·  Généré le ${today}`, M + 32, 27);

    // Confidential badge
    fill('#3B82F6');
    rr(W - M - 30, 13, 30, 8, 2);
    color('#FFFFFF');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIDENTIEL', W - M - 15, 18.5, { align: 'center' });

    // ── 2. KPI CARDS ──────────────────────────────────────────────────────
    let y = 53;
    const cw = (W - M * 2 - 9) / 4;
    const cards = [
      { label: 'PROJETS ACTIFS',  value: String(this.stats.totalProjets),    bg: '#EFF6FF', bar: '#3B82F6', txt: '#1D4ED8' },
      { label: 'AVANCEMENT MOY.', value: `${this.stats.avancementMoyen}%`,   bg: '#F0FDF4', bar: '#22C55E', txt: '#15803D' },
      { label: 'FICHES SUIVI',    value: String(this.stats.totalFiches),     bg: '#FFF7ED', bar: '#F97316', txt: '#C2410C' },
      { label: 'EN RETARD',       value: String(this.stats.projetsEnRetard), bg: '#FFF1F2', bar: '#F43F5E', txt: '#BE123C' },
    ];
    cards.forEach((c, i) => {
      const cx = M + i * (cw + 3);
      fill(c.bg);  rr(cx, y, cw, 30, 3);
      fill(c.bar); rr(cx, y, 3, 30, 1.5);
      color('#6B7280'); doc.setFontSize(6); doc.setFont('helvetica', 'bold');
      doc.text(c.label, cx + 7, y + 8);
      doc.setTextColor(...rgb(c.txt)); doc.setFontSize(20);
      doc.text(c.value, cx + 7, y + 24);
    });

    // ── 3. RÉPARTITION ────────────────────────────────────────────────────
    y += 38;
    fill('#F8FAFC'); draw('#E2E8F0');
    rr(M, y, W - M * 2, 50, 3, 'FD');

    color('#1E3A5F'); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Répartition des Projets par Statut', M + 6, y + 9);
    fill('#E2E8F0'); doc.rect(M + 6, y + 11, W - M * 2 - 12, 0.4, 'F');

    const statuses = [
      { label: 'Terminés',  count: this.stats.projetsTermines, col: '#22C55E' },
      { label: 'En Cours',  count: this.stats.projetsEnCours,  col: '#3B82F6' },
      { label: 'En Retard', count: this.stats.projetsEnRetard, col: '#F43F5E' },
    ];
    statuses.forEach((s, i) => {
      const bx = M + 6 + i * 58;
      const by = y + 16;
      const pct = this.stats.totalProjets ? Math.round(s.count / this.stats.totalProjets * 100) : 0;
      fill(s.col); doc.circle(bx + 2, by + 3, 2, 'F');
      color('#374151'); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
      doc.text(s.label, bx + 6, by + 4.5);
      doc.setTextColor(...rgb(s.col)); doc.setFontSize(20);
      doc.text(String(s.count), bx + 2, by + 18);
      fill(s.col + '30'); rr(bx + 2, by + 20, 20, 6, 2);
      doc.setTextColor(...rgb(s.col)); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      doc.text(`${pct}%`, bx + 12, by + 24.5, { align: 'center' });
    });

    // Stacked bar
    const barX = W - M - 14; const barY = y + 14; const barH = 32;
    fill('#E5E7EB'); rr(barX, barY, 8, barH, 2);
    let cur = barY + barH;
    [...statuses].reverse().forEach(s => {
      const pct = this.stats.totalProjets ? s.count / this.stats.totalProjets : 0;
      const segH = Math.max(pct * barH, 0.3); cur -= pct * barH;
      fill(s.col); rr(barX, cur, 8, segH, 1);
    });
    color('#9CA3AF'); doc.setFontSize(6); doc.setFont('helvetica', 'normal');
    doc.text('100%', barX + 4, barY - 1.5, { align: 'center' });

    // ── 4. PERFORMANCE GLOBALE ────────────────────────────────────────────
    y += 58;
    fill('#F8FAFC'); draw('#E2E8F0');
    rr(M, y, W - M * 2, 55, 3, 'FD');
    color('#1E3A5F'); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Résumé de la Performance Globale', M + 6, y + 9);
    fill('#E2E8F0'); doc.rect(M + 6, y + 11, W - M * 2 - 12, 0.4, 'F');

    const gx = M + 8; const gy = y + 17;
    const sColor = this.stats.avancementMoyen >= 75 ? '#22C55E' : this.stats.avancementMoyen >= 40 ? '#F97316' : '#F43F5E';
    fill('#E5E7EB'); rr(gx, gy, 72, 7, 3.5);
    fill(sColor);    rr(gx, gy, Math.max(4, this.stats.avancementMoyen / 100 * 72), 7, 3.5);
    doc.setTextColor(...rgb(sColor)); doc.setFontSize(28); doc.setFont('helvetica', 'bold');
    doc.text(`${this.stats.avancementMoyen}%`, gx, gy + 22);
    color('#6B7280'); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text('Score de performance qualité global', gx, gy + 29);

    const perf   = this.stats.avancementMoyen >= 75 ? 'SATISFAISANT' : this.stats.avancementMoyen >= 40 ? 'A AMELIORER' : 'INSUFFISANT';
    const perfBg = this.stats.avancementMoyen >= 75 ? '#F0FDF4' : this.stats.avancementMoyen >= 40 ? '#FFF7ED' : '#FFF1F2';
    fill(perfBg); rr(gx, gy + 32, 44, 8, 2);
    doc.setTextColor(...rgb(sColor)); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
    doc.text(perf, gx + 22, gy + 37, { align: 'center' });

    // Summary lines
    const sx = M + 95;
    color('#374151'); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    [
      `Ce rapport couvre l'ensemble des projets SMQ au ${today}.`,
      '',
      `• ${this.stats.totalProjets} projet(s) suivis au total`,
      `• ${this.stats.projetsEnCours} projet(s) en cours d'execution`,
      `• ${this.stats.totalFiches} fiche(s) de suivi enregistrees`,
      `• ${this.stats.projetsEnRetard} alerte(s) critique(s) active(s)`,
    ].forEach((line, li) => doc.text(line, sx, gy + li * 6.2));

    // ── 5. RECOMMANDATIONS ────────────────────────────────────────────────
    y += 63;
    fill('#EFF6FF'); draw('#BFDBFE');
    rr(M, y, W - M * 2, 28, 3, 'FD');
    color('#1D4ED8'); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text('Recommandations', M + 6, y + 8);
    color('#374151'); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    const rec = this.stats.projetsEnRetard > 0
      ? `${this.stats.projetsEnRetard} projet(s) signales en retard — une revision prioritaire est recommandee.`
      : 'Aucun projet critique detecte. Maintenez la cadence de suivi habituelle.';
    doc.text(rec, M + 6, y + 16);
    doc.text('Assurez-vous que toutes les fiches de suivi sont renseignees chaque semaine.', M + 6, y + 23);

    // ── 6. FOOTER ─────────────────────────────────────────────────────────
    fill('#1E3A5F'); doc.rect(0, H - 14, W, 14, 'F');
    color('#93C5FD'); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text('CNI Quality Monitor SMQ Platform  |  Rapport confidentiel  |  Usage interne uniquement', W / 2, H - 7, { align: 'center' });
    color('#FFFFFF');
    doc.text('Page 1 / 1', W - M, H - 7, { align: 'right' });

    // ── Save ──────────────────────────────────────────────────────────────
    doc.save(`Rapport_KPI_SMQ_${new Date().toISOString().split('T')[0]}.pdf`);
    this.toastr.success('Rapport PDF genere avec succes !');
    this.isExporting = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  downloadExcel() {
    this.downloadingExcel = true;
    this.kpiService.exportExcel().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = 'rapport_kpi.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingExcel = false;
      },
      error: () => { this.downloadingExcel = false; }
    });
  }
}
