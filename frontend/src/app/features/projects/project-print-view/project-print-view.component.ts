import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Projet } from '../../../models/projet.model';

@Component({
  selector: 'app-project-print-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-print-view.component.html',
  styleUrls: ['./project-print-view.component.css']
})
export class ProjectPrintViewComponent {
  @Input() projet!: Projet;

  getMoisArray(count: number = 12) {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  isMonthActive(actionMois: number[], month: number): boolean {
    return actionMois.includes(month);
  }
}
