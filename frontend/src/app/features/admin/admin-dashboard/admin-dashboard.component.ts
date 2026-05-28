import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KpiService } from '../../../services/kpi.service';
import { GlobalStats } from '../../../models/kpi.model';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  kpiService = inject(KpiService);
  stats: GlobalStats | null = null;

  // Chart Properties
  public pieChartOptions = { responsive: true, maintainAspectRatio: false };
  public pieChartLabels = ['Admin', 'Chef de Projet', 'Pilote Qualité'];
  public pieChartData = {
    labels: this.pieChartLabels,
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#a855f7', '#14b8a6', '#f59e0b'] }]
  };

  public barChartOptions = { responsive: true, maintainAspectRatio: false };
  public barChartLabels = ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'];
  public barChartData = {
    labels: this.barChartLabels,
    datasets: [{ data: [0, 0, 0, 0], label: 'Nouveaux Projets', backgroundColor: '#14b8a6' }]
  };

  ngOnInit() {
    this.kpiService.getGlobalStats().subscribe({
      next: (data) => {
        this.stats = data;
        
        if (data.usersByRole) {
          this.pieChartData = {
            ...this.pieChartData,
            datasets: [{ ...this.pieChartData.datasets[0], data: [data.usersByRole.admin, data.usersByRole.chef, data.usersByRole.pilote] }]
          };
        }
        
        if (data.projetsParMois) {
          this.barChartData = {
            ...this.barChartData,
            datasets: [{ ...this.barChartData.datasets[0], data: data.projetsParMois }]
          };
        }
      }
    });
  }
}
