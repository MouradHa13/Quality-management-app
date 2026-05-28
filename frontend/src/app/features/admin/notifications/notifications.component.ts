import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  template: `
    <div class="p-6 sm:p-10 min-h-screen bg-gray-50/50 dark:bg-transparent">
      <div class="max-w-4xl mx-auto">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 class="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Centre de <span class="text-primary">Notifications</span></h1>
            <p class="text-gray-500 dark:text-gray-400 font-medium">Gérez vos alertes et demandes système</p>
          </div>
          <button (click)="markAllAsRead()" 
                  class="flex items-center px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm group">
            <mat-icon class="mr-2 text-primary group-hover:rotate-12 transition-transform">done_all</mat-icon>
            Tout marquer comme lu
          </button>
        </div>

        <div class="glass-card overflow-hidden border border-white/20 dark:border-white/5 shadow-2xl">
          <div *ngIf="notifications.length === 0" class="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div class="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
              <mat-icon style="font-size: 40px; width: 40px; height: 40px;">notifications_none</mat-icon>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucune notification</h3>
            <p class="text-gray-500 dark:text-gray-400 max-w-xs">Vous êtes à jour ! Toutes les notifications ont été traitées.</p>
          </div>

          <div class="divide-y divide-gray-100 dark:divide-white/5">
            <div *ngFor="let n of notifications" 
                 class="group p-6 hover:bg-primary/5 transition-all relative overflow-hidden"
                 [ngClass]="{'bg-primary/5': !n.lu, 'bg-white': n.lu}">
              
              <!-- Left accent for unread -->
              <div *ngIf="!n.lu" class="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>

              <div class="flex items-start gap-5">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110" 
                     [ngClass]="n.type === 'WARNING' ? 'bg-orange-100 text-orange-500' : 'bg-primary/10 text-primary'">
                  <mat-icon>{{ n.type === 'WARNING' ? 'report_problem' : 'info' }}</mat-icon>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start mb-1">
                    <span class="text-[10px] font-black uppercase tracking-widest" 
                          [ngClass]="n.type === 'WARNING' ? 'text-orange-500' : 'text-primary'">
                      {{ n.type }}
                    </span>
                    <span class="text-[11px] text-gray-400 font-medium">
                      {{ n.dateEnvoi | date:'dd MMM yyyy HH:mm' }}
                    </span>
                  </div>
                  <p class="text-gray-800 dark:text-gray-200 font-bold text-lg leading-snug mb-3">
                    {{ n.message }}
                  </p>
                  
                  <div class="flex items-center gap-4">
                    <button *ngIf="!n.lu" 
                            (click)="markAsRead(n.id)"
                            class="text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center">
                      <mat-icon class="text-sm mr-1">done</mat-icon> Marquer comme lu
                    </button>
                    <button (click)="deleteNotification(n.id)"
                            class="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-danger transition-colors flex items-center">
                      <mat-icon class="text-sm mr-1">delete</mat-icon> Supprimer
                    </button>
                  </div>
                </div>

                <div *ngIf="!n.lu" class="w-2 h-2 rounded-full bg-primary shadow-glow-primary"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      border-radius: 2rem;
    }
    :host-context(.dark) .glass-card {
      background: rgba(30, 32, 47, 0.6);
    }
    .shadow-glow-primary {
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
    }
  `]
})
export class AdminNotificationsComponent implements OnInit {
  notifications: any[] = [];
  private notificationService = inject(NotificationService);

  ngOnInit() {
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

  markAsRead(id: any) {
    this.notificationService.markAsRead(id).subscribe(() => {
      this.loadNotifications();
    });
  }

  markAllAsRead() {
    this.notificationService.marquerToutCommeLue().subscribe(() => {
      this.loadNotifications();
    });
  }

  deleteNotification(id: any) {
    if (confirm('Voulez-vous vraiment supprimer cette notification ?')) {
      this.notificationService.deleteNotification(id).subscribe(() => {
        this.loadNotifications();
      });
    }
  }
}
