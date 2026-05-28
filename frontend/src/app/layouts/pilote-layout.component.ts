import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-pilote-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col h-screen overflow-hidden">
        <app-navbar></app-navbar>
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
          <div class="animate-fade-in"><router-outlet></router-outlet></div>
        </main>
      </div>
    </div>
  `
})
export class PiloteLayoutComponent {}
