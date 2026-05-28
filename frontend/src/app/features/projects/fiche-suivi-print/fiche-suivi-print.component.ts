import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fiche-suivi-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fiche-suivi-print.component.html',
  styleUrls: ['./fiche-suivi-print.component.css']
})
export class FicheSuiviPrintComponent {
  @Input() ficheSuivi: any;
  @Input() projectName: string = '';

  currentDate = new Date();

  print() {
    window.print();
  }
}
