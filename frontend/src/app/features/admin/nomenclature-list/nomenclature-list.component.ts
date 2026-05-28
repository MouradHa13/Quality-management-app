import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-nomenclature-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTableModule],
  templateUrl: './nomenclature-list.component.html',
  styleUrl: './nomenclature-list.component.css'
})
export class NomenclatureListComponent implements OnInit {
  private http = inject(HttpClient);
  nomenclatures: any[] = [];
  displayedColumns: string[] = ['nom', 'type', 'desc', 'actions'];

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/nomenclatures`).subscribe(data => this.nomenclatures = data);
  }
}
