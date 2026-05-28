import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { Utilisateur, RoleNom } from '../../../models/utilisateur.model';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MatIconModule],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-8 animate-fade-in">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
        <button routerLink="/admin/users/create" class="flex items-center px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
          <span class="material-icons mr-2">person_add</span>
          Ajouter un utilisateur
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="glass-card p-6 mb-8 animate-slide-up">
        <div class="flex flex-col md:flex-row gap-6">
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <span class="material-icons text-sm">search</span>
            </span>
            <input type="text" [(ngModel)]="searchTerm" (input)="onSearchInput()" 
                   placeholder="Rechercher par nom ou email..." class="input-field pl-10" />
          </div>
          
          <div class="relative w-full md:w-64">
            <select [(ngModel)]="roleFilter" (ngModelChange)="onFilterChange()" class="input-field appearance-none">
              <option value="">Tous les rôles</option>
              <option [value]="RoleNom.ADMIN">ADMIN</option>
              <option [value]="RoleNom.CHEF_PROJET">CHEF_PROJET</option>
              <option [value]="RoleNom.PILOTE_QUALITE">PILOTE_QUALITE</option>
            </select>
          </div>

          <button (click)="loadUsers()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center">
            <span class="material-icons mr-2">refresh</span>
            Actualiser
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div class="glass-card overflow-hidden animate-slide-up animation-delay-500">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr *ngFor="let user of users" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {{ (user.nom || user.email || '?')[0] | uppercase }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ user.nom }} {{ user.prenom }}</div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs rounded-full font-medium"
                        [ngClass]="{
                          'bg-purple-100 text-purple-700': getUserRole(user) === RoleNom.ADMIN,
                          'bg-blue-100 text-blue-700': getUserRole(user) === RoleNom.CHEF_PROJET,
                          'bg-green-100 text-green-700': getUserRole(user) === RoleNom.PILOTE_QUALITE
                        }">
                    {{ getUserRole(user) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col space-y-1">
                    <span class="flex items-center">
                      <span class="h-2 w-2 rounded-full mr-2" [class.bg-green-500]="user.actif" [class.bg-red-500]="!user.actif"></span>
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ user.actif ? 'Actif' : 'Inactif' }}</span>
                    </span>
                    <span class="text-[10px] flex items-center" [class.text-green-500]="isOnline(user)" [class.text-gray-400]="!isOnline(user)">
                      <span class="material-icons text-[10px] mr-1" [class.animate-pulse]="isOnline(user)">{{ isOnline(user) ? 'fiber_manual_record' : 'schedule' }}</span>
                      {{ isOnline(user) ? 'En ligne' : (user.lastSeen ? 'Vu le ' + (user.lastSeen | date:'HH:mm') : 'Hors ligne') }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex space-x-2">
                    <button (click)="toggleUserStatus(user)" class="p-2 text-gray-400 hover:text-primary transition-colors" title="Toggle Statut">
                      <span class="material-icons text-xl">{{ user.actif ? 'block' : 'check_circle' }}</span>
                    </button>
                    <button (click)="openEditModal(user)" class="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Modifier">
                      <span class="material-icons text-xl">edit</span>
                    </button>
                    <button (click)="deleteUser(user)" class="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
                      <span class="material-icons text-xl">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="users.length === 0" class="p-12 text-center text-gray-500">
            <span class="material-icons text-4xl mb-2">search_off</span>
            <p>Aucun utilisateur ne correspond à votre recherche.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div *ngIf="isEditModalOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div (click)="closeEditModal()" class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-scale-in">
          <div class="p-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white" id="modal-title">
                Modifier l'utilisateur
              </h3>
              <button (click)="closeEditModal()" class="text-gray-400 hover:text-gray-500">
                <span class="material-icons">close</span>
              </button>
            </div>

            <form [formGroup]="editForm" (ngSubmit)="saveUserChanges()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                  <input type="text" formControlName="prenom" class="input-field py-2">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                  <input type="text" formControlName="nom" class="input-field py-2">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                <select formControlName="role" class="input-field py-2 appearance-none">
                  <option [value]="RoleNom.ADMIN">ADMIN</option>
                  <option [value]="RoleNom.CHEF_PROJET">CHEF_PROJET</option>
                  <option [value]="RoleNom.PILOTE_QUALITE">PILOTE_QUALITE</option>
                </select>
              </div>

              <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Réinitialiser le mot de passe</label>
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <input 
                      [type]="showEditPassword ? 'text' : 'password'" 
                      formControlName="tempPassword" 
                      placeholder="Nouveau mot de passe" 
                      class="input-field py-2 pr-10"
                    >
                    <button type="button" (click)="showEditPassword = !showEditPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <mat-icon class="text-lg">{{ showEditPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                  </div>
                  <button type="button" (click)="resetUserPassword()" [disabled]="!editForm.get('tempPassword')?.value || editForm.get('tempPassword')?.invalid" 
                          class="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50">
                    Reset
                  </button>
                </div>

                <!-- Strength Indicator Bar -->
                <div *ngIf="editForm.get('tempPassword')?.value" class="mt-2">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-[10px] font-bold uppercase text-gray-400">Force</span>
                    <span class="text-[10px] font-bold uppercase" [ngClass]="getPasswordStrengthEdit().color.replace('bg-', 'text-')">
                      {{ getPasswordStrengthEdit().label }}
                    </span>
                  </div>
                  <div class="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full transition-all duration-500 ease-out" 
                         [ngClass]="getPasswordStrengthEdit().color"
                         [style.width.%]="getPasswordStrengthEdit().score"></div>
                  </div>
                </div>

                <div *ngIf="editForm.get('tempPassword')?.touched && editForm.get('tempPassword')?.invalid" class="mt-1 text-[10px] text-red-500">
                  <p *ngIf="editForm.get('tempPassword')?.errors?.['minlength']">Min. 8 caractères.</p>
                  <p *ngIf="editForm.get('tempPassword')?.errors?.['pattern']">Caractère spécial requis.</p>
                </div>
              </div>

              <div class="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button type="button" (click)="closeEditModal()" class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500">
                  Annuler
                </button>
                <button type="submit" [disabled]="editForm.invalid || isLoading" 
                        class="px-6 py-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition">
                  <span *ngIf="isLoading" class="mr-2 h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full inline-block"></span>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit, OnDestroy {
  userService = inject(UserService);
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  RoleNom = RoleNom;

  users: Utilisateur[] = [];
  searchTerm = '';
  roleFilter = '';
  
  // Edit Modal State
  isEditModalOpen = false;
  selectedUser: Utilisateur | null = null;
  showEditPassword = false;

  editForm = this.fb.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    role: ['', Validators.required],
    tempPassword: ['', [
      Validators.minLength(8),
      Validators.pattern(/[!@#$%^&*(),.?":{}|<>]/)
    ]]
  });

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  isLoading = false;

  getPasswordStrengthEdit(): { score: number, label: string, color: string } {
    const pwd = this.editForm.get('tempPassword')?.value || '';
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-200' };

    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 25;

    if (score <= 25) return { score, label: 'Faible', color: 'bg-red-500' };
    if (score <= 50) return { score, label: 'Moyen', color: 'bg-orange-500' };
    if (score <= 75) return { score, label: 'Bon', color: 'bg-blue-500' };
    return { score, label: 'Fort', color: 'bg-green-500' };
  }

  ngOnInit() {
    this.loadUsers();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      console.log('DEBUG: Debounced search triggered for:', term);
      this.loadUsers();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers() {
    console.log(`DEBUG: loadUsers called. Search: "${this.searchTerm}", Role: "${this.roleFilter}"`);
    this.userService.getAllUsers(0, 100, this.searchTerm, this.roleFilter).subscribe({
      next: (res) => {
        console.log(`DEBUG: Received ${res?.length || 0} users from API`);
        let filtered = res || [];
        
        // Local fallback filtering in case the API didn't filter correctly
        if (this.searchTerm) {
          const s = this.searchTerm.toLowerCase();
          filtered = filtered.filter(u => 
            u.nom?.toLowerCase().includes(s) || 
            u.prenom?.toLowerCase().includes(s) || 
            u.email?.toLowerCase().includes(s)
          );
          console.log(`DEBUG: After local filter, ${filtered.length} users remain`);
        }
        
        if (this.roleFilter) {
          const r = this.roleFilter.toLowerCase();
          filtered = filtered.filter(u => {
            const roleName = this.getUserRole(u).toLowerCase();
            return roleName.includes(r);
          });
        }

        this.users = filtered;
      },
      error: (err) => {
        console.error('DEBUG: Error fetching users:', err);
        this.toastr.error('Erreur lors du chargement des utilisateurs');
      }
    });
  }

  onSearchInput() {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange() {
    console.log('DEBUG: Role filter changed to:', this.roleFilter);
    this.loadUsers();
  }

  isOnline(user: Utilisateur): boolean {
    if (!user.lastSeen) return false;
    const lastSeen = new Date(user.lastSeen).getTime();
    const now = new Date().getTime();
    return (now - lastSeen) < 5 * 60 * 1000; // 5 minutes
  }

  // Edit Modal Methods
  openEditModal(user: Utilisateur) {
    this.selectedUser = user;
    this.editForm.patchValue({
      prenom: user.prenom || '',
      nom: user.nom || '',
      role: this.getUserRole(user),
      tempPassword: ''
    });
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedUser = null;
    this.editForm.reset();
  }

  saveUserChanges() {
    if (this.editForm.invalid || !this.selectedUser?.id) return;

    this.isLoading = true;
    const formValue = this.editForm.value;
    const updateData: Partial<Utilisateur> = {
      nom: formValue.nom || '',
      prenom: formValue.prenom || '',
      roles: [{ nomRole: formValue.role as RoleNom }]
    };

    this.userService.updateUser(this.selectedUser.id, updateData).subscribe({
      next: (updated) => {
        this.toastr.success('Utilisateur mis à jour');
        this.loadUsers();
        this.closeEditModal();
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Erreur lors de la mise à jour');
        this.isLoading = false;
      }
    });
  }

  resetUserPassword() {
    if (!this.selectedUser?.id) return;
    const newPass = this.editForm.get('tempPassword')?.value;
    if (!newPass) return;

    this.userService.resetPasswordAdmin(this.selectedUser.id, newPass).subscribe({
      next: () => {
        this.toastr.success('Mot de passe réinitialisé');
        this.editForm.get('tempPassword')?.setValue('');
      },
      error: () => this.toastr.error('Erreur lors de la réinitialisation')
    });
  }

  toggleUserStatus(user: Utilisateur) {
    if (!user.id) return;
    this.userService.toggleStatus(user.id).subscribe({
      next: (updated) => {
        user.actif = updated.actif;
        this.toastr.success(`Statut mis à jour pour ${user.email}`);
      }
    });
  }

  deleteUser(user: Utilisateur) {
    if (!user.id || !confirm('Supprimer cet utilisateur ?')) return;
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.toastr.success('Utilisateur supprimé');
      }
    });
  }

  getUserRole(user: Utilisateur): string {
    if (user.role?.nomRole) return user.role.nomRole;
    if (user.roles && user.roles.length > 0) return user.roles[0].nomRole;
    return 'N/A';
  }
}
