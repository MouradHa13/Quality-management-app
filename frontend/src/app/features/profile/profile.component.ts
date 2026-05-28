import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { MatIconModule } from '@angular/material/icon';
import { Utilisateur } from '../../models/utilisateur.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastr = inject(ToastrService);

  profileForm: FormGroup = this.fb.group({
    nom: ['', Validators.required],
    prenom: [''],
    email: [{ value: '', disabled: true }],
    structure: ['']
  });

  passwordForm: FormGroup = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/[!@#$%^&*(),.?":{}|<>]/)
    ]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  currentUser: Utilisateur | null = null;
  isEditing = false;
  isChangingPassword = false;
  isLoading = false;
  isPasswordLoading = false;
  showOldPassword = false;
  showNewPassword = false;

  getPasswordStrength(): { score: number, label: string, color: string } {
    const pwd = this.passwordForm.get('newPassword')?.value || '';
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

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
          structure: (user as any).structure?.nomStructure || 'N/A'
        });
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.ngOnInit(); // Reset form
    }
  }

  saveProfile() {
    if (this.profileForm.invalid || !this.currentUser?.id) return;
    
    this.isLoading = true;
    const updateData = {
      nom: this.profileForm.value.nom,
      prenom: this.profileForm.value.prenom
    };

    this.userService.updateUser(this.currentUser.id, updateData).subscribe({
      next: (updated) => {
        this.toastr.success('Profil mis à jour avec succès');
        this.isEditing = false;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Erreur lors de la mise à jour du profil');
        this.isLoading = false;
      }
    });
  }

  togglePasswordEdit() {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.passwordForm.reset();
    }
  }

  changePassword() {
    if (this.passwordForm.invalid || !this.currentUser?.id) return;

    this.isPasswordLoading = true;
    const { oldPassword, newPassword } = this.passwordForm.value;

    this.userService.changePassword(this.currentUser.id, oldPassword, newPassword).subscribe({
      next: () => {
        this.toastr.success('Mot de passe changé avec succès');
        this.isChangingPassword = false;
        this.isPasswordLoading = false;
        this.passwordForm.reset();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Ancien mot de passe incorrect');
        this.isPasswordLoading = false;
      }
    });
  }
}
