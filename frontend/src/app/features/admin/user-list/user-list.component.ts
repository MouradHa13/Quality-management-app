import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTableModule],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  private http = inject(HttpClient);
  users: any[] = [];
  displayedColumns: string[] = ['nom', 'email', 'role', 'actions'];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/users`).subscribe(data => this.users = data);
  }

  getRoleClass(role: string) {
    switch (role) {
      case 'ADMIN': return 'bg-purple-50 text-purple-700';
      case 'CHEF_PROJET': return 'bg-blue-50 text-blue-700';
      case 'PILOTE_QUALITE': return 'bg-amber-50 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
