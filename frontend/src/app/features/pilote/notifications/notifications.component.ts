import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  notifications: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading = true;
    this.notificationService.getAllNotifications().subscribe({
      next: (data) => {
        this.notifications = data.sort((a: any, b: any) =>
          new Date(b.dateEnvoi).getTime() - new Date(a.dateEnvoi).getTime()
        );
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.lu).length;
  }

  markAsRead(id: string) {
    this.notificationService.markAsRead(id).subscribe(() => {
      const notif = this.notifications.find(n => n.id === id);
      if (notif) notif.lu = true;
    });
  }

  markAllAsRead() {
    this.notificationService.marquerToutCommeLue().subscribe(() => {
      this.notifications.forEach(n => n.lu = true);
    });
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'EMAIL': 'email',
      'SMS': 'sms',
      'SMS_MOCK': 'sms',
      'WARNING': 'warning',
      'INFO': 'info',
    };
    return icons[type] || 'notifications';
  }

  getTypeColor(type: string, lu: boolean): string {
    if (lu) return 'bg-gray-100 dark:bg-gray-700 text-gray-400';
    const colors: Record<string, string> = {
      'WARNING': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
      'EMAIL': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
      'SMS': 'bg-green-100 dark:bg-green-900/30 text-green-600',
      'SMS_MOCK': 'bg-green-100 dark:bg-green-900/30 text-green-600',
    };
    return colors[type] || 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
  }
}
