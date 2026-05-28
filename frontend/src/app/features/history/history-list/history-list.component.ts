import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-history-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
<div class="p-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-3xl space-y-8 animate-fade-in">
  <div class="max-w-7xl mx-auto space-y-8">
    
    <!-- Premium Header Area -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span class="material-icons">history</span>
          </div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Historique d'Activité</h1>
        </div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-13">Suivi complet des modifications du système</p>
      </div>

      <!-- Modern Search Input Capsule -->
      <div class="relative w-full md:w-80">
        <input 
          (keyup)="applyFilter($event)" 
          placeholder="Rechercher une action, un auteur..." 
          class="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200/60 bg-white/80 dark:bg-slate-900/80 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        >
        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
      </div>
    </div>

    <!-- Modern Glass Table Container -->
    <div class="glass-card overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-2xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Auteur</th>
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entité</th>
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Détails</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr *ngFor="let item of paginatedHistory" class="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors group">
              <!-- Date Column -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-slate-400 text-sm">event</span>
                  <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {{ item.actionDate | date:'dd MMM yyyy' }}
                  </span>
                  <span class="text-[10px] text-slate-400">
                    {{ item.actionDate | date:'HH:mm' }}
                  </span>
                </div>
              </td>

              <!-- Auteur Column -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs shadow-inner">
                    {{ item.auteur ? item.auteur[0].toUpperCase() : 'U' }}
                  </div>
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {{ item.auteur }}
                  </span>
                </div>
              </td>

              <!-- Action Column -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all"
                      [ngClass]="{
                        'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400': item.action === 'CREATE',
                        'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400': item.action === 'UPDATE',
                        'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400': item.action === 'DELETE'
                      }">
                  {{ item.action }}
                </span>
              </td>

              <!-- Entité Column -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {{ item.entiteConcernee }}
                </span>
              </td>

              <!-- Details Column -->
              <td class="px-6 py-4 max-w-md truncate">
                <span class="text-xs text-slate-600 dark:text-slate-300">
                  {{ item.details }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No Results State -->
      <div *ngIf="paginatedHistory.length === 0" class="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4 text-slate-400">
          <span class="material-icons text-3xl">history</span>
        </div>
        <p class="text-sm font-bold text-slate-500 dark:text-slate-400">Aucun historique d'activité disponible</p>
        <p class="text-xs text-slate-400 mt-1">Essayez d'ajuster vos filtres de recherche.</p>
      </div>

      <!-- Pagination Footer -->
      <div class="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Affichage {{ filteredHistory.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }} - {{ getMin(currentPage * pageSize, filteredHistory.length) }} sur {{ filteredHistory.length }}
        </p>

        <div class="flex items-center gap-2">
          <button 
            (click)="prevPage()" 
            [disabled]="currentPage === 1"
            class="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-all shadow-sm">
            <span class="material-icons text-sm">chevron_left</span>
          </button>
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ currentPage }} / {{ totalPages || 1 }}</span>
          <button 
            (click)="nextPage()" 
            [disabled]="currentPage === totalPages || totalPages === 0"
            class="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-all shadow-sm">
            <span class="material-icons text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class HistoryListComponent implements OnInit {
  private http = inject(HttpClient);
  
  rawHistory: any[] = [];
  filteredHistory: any[] = [];
  searchTerm = '';
  
  currentPage = 1;
  pageSize = 10;

  constructor() {
    console.log('HISTORY_PREMIUM_VERSION_LOADED');
  }

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.http.get<any[]>(`${environment.apiUrl}/api/historique`).subscribe(data => {
      this.rawHistory = (data || []).map(item => ({
        ...item,
        actionDate: item.dateModification || item.dateAction || item.date || new Date().toISOString()
      }));
      // Sort history descending by date
      this.rawHistory.sort((a, b) => new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime());
      this.filterData();
    });
  }

  filterData() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredHistory = [...this.rawHistory];
    } else {
      this.filteredHistory = this.rawHistory.filter(item => 
        (item.auteur || '').toLowerCase().includes(term) ||
        (item.action || '').toLowerCase().includes(term) ||
        (item.entiteConcernee || '').toLowerCase().includes(term) ||
        (item.details || '').toLowerCase().includes(term)
      );
    }
    this.currentPage = 1; // Reset to first page on filter change
  }

  applyFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filterData();
  }

  get paginatedHistory() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredHistory.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredHistory.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }
}
