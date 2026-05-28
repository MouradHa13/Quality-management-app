import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { Utilisateur } from '../../models/utilisateur.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);

  notifications: any[] = [];
  showNotificationsDropdown = false;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showNotificationsDropdown = false;
    }
  }

  navigateTo(notification: any) {
    if (!notification.lu) {
      this.markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      this.router.navigateByUrl(notification.actionUrl);
      this.showNotificationsDropdown = false;
    }
  }

  user$ = this.authService.currentUser$;
  isDarkMode = false;

  showProfileModal = false;
  profileForm: FormGroup = this.fb.group({
    nom: ['', Validators.required],
    prenom: [''],
    email: [{value: '', disabled: true}]
  });

  constructor() {
    // Persistent Theme logic
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove('dark');
    }

    this.user$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || ''
        });
      }
    });

    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.getAllNotifications().subscribe({
      next: (data) => {
        this.notifications = data.sort((a: any, b: any) => 
          new Date(b.dateEnvoi).getTime() - new Date(a.dateEnvoi).getTime()
        );
      }
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.lu).length;
  }

  getNotificationsLink(user: any): string {
    if (!user) return '/login';
    const role = this.getUserRole(user);
    if (role === 'ADMIN') return '/admin/notifications';
    if (role === 'CHEF_PROJET') return '/chef/history'; // or dedicated page
    if (role === 'PILOTE_QUALITE') return '/pilote/notifications';
    return '/dashboard';
  }

  markAllAsRead() {
    this.notificationService.marquerToutCommeLue().subscribe(() => {
      this.loadNotifications();
    });
  }

  markAsRead(id: any, event?: Event) {
    if (event) event.stopPropagation();
    this.notificationService.markAsRead(id).subscribe(() => {
      this.loadNotifications();
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  logout() {
    this.authService.logout();
  }

  openProfileModal() {
    this.showProfileModal = true;
  }

  closeProfileModal() {
    this.showProfileModal = false;
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    const user = this.authService.currentUser;
    if (!user?.id) return;

    this.userService.updateUser(user.id, this.profileForm.getRawValue()).subscribe({
      next: (updated) => {
        this.toastr.success('Profil mis à jour avec succès');
        // Refresh token/user state here if needed
        this.closeProfileModal();
      },
      error: () => {
        this.toastr.error('Erreur lors de la mise à jour du profil');
      }
    });
  }

  getUserRole(user: Utilisateur): string {
    if (user.role?.nomRole) return user.role.nomRole;
    if (user.roles && user.roles.length > 0) {
      const r = user.roles[0];
      return typeof r === 'string' ? r : r.nomRole;
    }
    return '';
  }
}
