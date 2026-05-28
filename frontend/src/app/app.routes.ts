import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { RoleNom } from './models/utilisateur.model';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { ChefLayoutComponent } from './layouts/chef-layout/chef-layout.component';
import { PiloteLayoutComponent } from './layouts/pilote-layout/pilote-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleNom.ADMIN] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { 
        path: 'users', 
        children: [
          { path: '', loadComponent: () => import('./features/admin/users/user-list.component').then(m => m.UserListComponent) },
          { path: 'create', loadComponent: () => import('./features/admin/users/user-create.component').then(m => m.UserCreateComponent) }
        ]
      },
      { path: 'nomenclatures', loadComponent: () => import('./features/admin/admin-nomenclatures/admin-nomenclatures.component').then(m => m.AdminNomenclaturesComponent) },
      { path: 'notifications', loadComponent: () => import('./features/admin/notifications/notifications.component').then(m => m.AdminNotificationsComponent) },
      { path: 'history', loadComponent: () => import('./features/history/history-list/history-list.component').then(m => m.HistoryListComponent) }
    ]
  },
  {
    path: 'chef',
    component: ChefLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleNom.CHEF_PROJET] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/chef-projet/dashboard/chef-dashboard.component').then(m => m.ChefDashboardComponent) },
      { 
        path: 'projets', 
        children: [
          { path: '', loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent) },
          { path: ':id', loadComponent: () => import('./features/projects/fiche-projet-details/fiche-projet-details.component').then(m => m.FicheProjetDetailsComponent) }
        ]
      },
      { path: 'fiches', loadComponent: () => import('./features/fiches/fiche-list/fiche-list.component').then(m => m.FicheListComponent) },
      { path: 'history', loadComponent: () => import('./features/history/history-list/history-list.component').then(m => m.HistoryListComponent) }
    ]
  },
  {
    path: 'pilote',
    component: PiloteLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleNom.PILOTE_QUALITE] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/pilote/dashboard/pilote-dashboard.component').then(m => m.PiloteDashboardComponent) },
      { path: 'fiches', loadComponent: () => import('./features/fiches/fiche-list/fiche-list.component').then(m => m.FicheListComponent) },
      { path: 'projets/:id', loadComponent: () => import('./features/projects/fiche-projet-details/fiche-projet-details.component').then(m => m.FicheProjetDetailsComponent) },
      { path: 'kpi', loadComponent: () => import('./features/pilote/kpi/kpi-reports.component').then(m => m.KpiReportsComponent) },
      { path: 'notifications', loadComponent: () => import('./features/pilote/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'history', loadComponent: () => import('./features/history/history-list/history-list.component').then(m => m.HistoryListComponent) }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
