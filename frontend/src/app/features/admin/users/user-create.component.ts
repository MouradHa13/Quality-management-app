import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { Role, RoleNom, Utilisateur } from '../../../models/utilisateur.model';
import { ToastrService } from 'ngx-toastr';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatIconModule, RouterModule],
  templateUrl: './user-create.component.html'
})
export class UserCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  userForm: FormGroup = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
    ]],
    roleId: ['', Validators.required],
    actif: [true]
  });

  roles: Role[] = [];
  showPassword = false;
  isSubmitting = false;

  ngOnInit() {
    this.userService.getRoles().subscribe({
      next: (roles) => this.roles = roles,
      error: () => this.toastr.error('Erreur lors du chargement des rôles')
    });
  }

  onSubmit() {
    if (this.userForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formValue = this.userForm.value;
    const selectedRole = this.roles.find(r => r.id === formValue.roleId);

    const newUser: Partial<Utilisateur> = {
      nom: formValue.nom as string,
      prenom: formValue.prenom as string,
      email: formValue.email as string,
      motDePasse: formValue.motDePasse as string,
      roles: [selectedRole as Role],
      actif: formValue.actif as boolean
    };

    this.userService.createUser(newUser).subscribe({
      next: () => {
        this.toastr.success('Utilisateur créé avec succès');
        this.router.navigate(['/admin/users']);
      },
      error: () => {
        this.isSubmitting = false;
        this.toastr.error('Erreur lors de la création de l\'utilisateur');
      }
    });
  }

  getRoleIcon(roleNom: string): string {
    switch (roleNom) {
      case 'ADMIN': return 'admin_panel_settings';
      case 'CHEF_PROJET': return 'manage_accounts';
      case 'PILOTE_QUALITE': return 'verified_user';
      default: return 'person';
    }
  }

  getRoleDescription(roleNom: string): string {
    switch (roleNom) {
      case 'ADMIN': return 'Accès total au système et gestion des utilisateurs';
      case 'CHEF_PROJET': return 'Gestion des projets et saisie des fiches de suivi';
      case 'PILOTE_QUALITE': return 'Surveillance des indicateurs et validation finale';
      default: return 'Accès standard';
    }
  }

  getPasswordStrength(): { score: number, label: string, color: string } {
    const pwd = this.userForm.get('motDePasse')?.value || '';
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
}
