import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FicheTest } from '../../../../models/fiche-test.model';

@Component({
  selector: 'app-fiche-test-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fiche-test-print.component.html',
  styleUrls: ['./fiche-test-print.component.css']
})
export class FicheTestPrintComponent implements OnInit {
  @Input() ficheTest!: FicheTest;
  @Input() projectName: string = '';

  currentDate = new Date();

  ngOnInit() {
  }

  print() {
    window.print();
  }
}
