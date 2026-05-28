import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../core/services/auth.service';
import { Utilisateur, RoleNom } from '../../models/utilisateur.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  isPasswordVisible = false;
  isForgotPasswordMode = false;
  forgotPasswordEmail = '';

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.spinner.show();
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (user: Utilisateur) => {
        this.spinner.hide();
        this.toastr.success(`Bienvenue!`, 'Connexion réussie');
        
        const role = this.authService.getCurrentUserRole();
        console.log('Login successful, role:', role);

        if (role === RoleNom.ADMIN) {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === RoleNom.CHEF_PROJET) {
          this.router.navigate(['/chef/dashboard']);
        } else if (role === RoleNom.PILOTE_QUALITE) {
          this.router.navigate(['/pilote/dashboard']);
        } else {
          this.router.navigate(['/admin/dashboard']); // Fallback
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        const msg = err.error?.message || 'Email ou mot de passe incorrect';
        this.toastr.error(msg, 'Erreur de connexion');
      }
    });
  }

  toggleForgotPasswordMode() {
    this.isForgotPasswordMode = !this.isForgotPasswordMode;
    this.forgotPasswordEmail = this.loginForm.get('email')?.value || '';
  }

  onForgotPassword() {
    if (!this.forgotPasswordEmail || !this.forgotPasswordEmail.includes('@')) {
      this.toastr.warning('Veuillez saisir une adresse e-mail valide');
      return;
    }

    this.spinner.show();
    this.authService.forgotPassword(this.forgotPasswordEmail).subscribe({
      next: (res) => {
        this.spinner.hide();
        this.toastr.success(res.message || 'Demande envoyée à l\'administrateur');
        this.isForgotPasswordMode = false;
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Erreur lors de l\'envoi de la demande');
      }
    });
  }
}
