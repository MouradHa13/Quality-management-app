import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RoleNom } from '../../models/utilisateur.model';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: RoleNom[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  
  menuItems: MenuItem[] = [];
  collapsed = false;

  ngOnInit(): void {
    const allItems: MenuItem[] = [
      // Admin Menu
      { label: 'Tableau de bord', icon: 'dashboard', route: '/admin/dashboard', roles: [RoleNom.ADMIN] },
      { label: 'Utilisateurs', icon: 'people', route: '/admin/users', roles: [RoleNom.ADMIN] },
      { label: 'Nomenclatures', icon: 'category', route: '/admin/nomenclatures', roles: [RoleNom.ADMIN] },
      { label: 'Historique global', icon: 'history', route: '/admin/history', roles: [RoleNom.ADMIN] },

      // Chef de Projet Menu
      { label: 'Tableau de bord', icon: 'dashboard', route: '/chef/dashboard', roles: [RoleNom.CHEF_PROJET] },
      { label: 'Mes Projets', icon: 'folder', route: '/chef/projets', roles: [RoleNom.CHEF_PROJET] },
      { label: 'Mes Fiches', icon: 'description', route: '/chef/fiches', roles: [RoleNom.CHEF_PROJET] },
      { label: 'Historique personnel', icon: 'history', route: '/chef/history', roles: [RoleNom.CHEF_PROJET] },

      // Pilote Qualité Menu
      { label: 'Tableau de bord', icon: 'dashboard', route: '/pilote/dashboard', roles: [RoleNom.PILOTE_QUALITE] },
      { label: 'Toutes les Fiches', icon: 'format_list_bulleted', route: '/pilote/fiches', roles: [RoleNom.PILOTE_QUALITE] },
      { label: 'KPI & Rapports', icon: 'analytics', route: '/pilote/kpi', roles: [RoleNom.PILOTE_QUALITE] },
      { label: 'Notifications', icon: 'notifications', route: '/pilote/notifications', roles: [RoleNom.PILOTE_QUALITE] },
      { label: 'Historique', icon: 'history', route: '/pilote/history', roles: [RoleNom.PILOTE_QUALITE] },
      
      // Common Menu
      { label: 'Mon Profil', icon: 'person', route: '/profile', roles: [RoleNom.ADMIN, RoleNom.CHEF_PROJET, RoleNom.PILOTE_QUALITE] },
    ];

    this.authService.currentUser$.subscribe(user => {
      const role = user?.role?.nomRole;
      if (role) {
        this.menuItems = allItems.filter(item => item.roles.includes(role));
      } else {
        this.menuItems = [];
      }
    });
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
}
