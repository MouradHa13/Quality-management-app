import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KPIService } from '../../core/services/kpi.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private kpiService = inject(KPIService);

  ngOnInit() {
    this.initCharts();
  }

  initCharts() {
    setTimeout(() => {
      const evolutionCtx = document.getElementById('evolutionChart') as HTMLCanvasElement;
      if (evolutionCtx) {
        const gradient = evolutionCtx.getContext('2d')?.createLinearGradient(0, 0, 0, 400);
        gradient?.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
        gradient?.addColorStop(1, 'rgba(79, 70, 229, 0)');

        new Chart(evolutionCtx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
            datasets: [{
              label: 'Performance',
              data: [12, 19, 15, 25, 22, 30],
              borderColor: '#4f46e5',
              borderWidth: 4,
              pointBackgroundColor: '#fff',
              pointBorderColor: '#4f46e5',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              backgroundColor: gradient,
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                titleFont: { family: 'Outfit', size: 14, weight: 700 },
                bodyFont: { family: 'Outfit', size: 13 },
                cornerRadius: 12,
                displayColors: false
              }
            },
            scales: {
              y: { grid: { display: false }, ticks: { font: { family: 'Outfit' } } },
              x: { grid: { display: false }, ticks: { font: { family: 'Outfit' } } }
            }
          }
        });
      }

      new Chart('statusChart', {
        type: 'doughnut',
        data: {
          labels: ['En cours', 'Terminé', 'Retard', 'Suspendu'],
          datasets: [{
            data: [45, 30, 15, 10],
            backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 20
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 30,
                font: { family: 'Outfit', size: 12, weight: 600 }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              padding: 12,
              cornerRadius: 12,
              titleFont: { family: 'Outfit' },
              bodyFont: { family: 'Outfit' }
            }
          }
        }
      });
    }, 500);
  }

  exportPDF() {
    this.kpiService.exportPDF().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kpi_report.pdf';
      a.click();
    });
  }

  exportExcel() {
    this.kpiService.exportExcel().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kpi_report.xlsx';
      a.click();
    });
  }
}
