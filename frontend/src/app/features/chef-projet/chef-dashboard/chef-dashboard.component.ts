import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ProjetService } from '../../../services/projet.service';
import { FicheService } from '../../../services/fiche.service';
import { Projet, FicheSuivi } from '../../../models/projet.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-chef-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './chef-dashboard.component.html',
  styleUrls: ['./chef-dashboard.component.css']
})
export class ChefDashboardComponent implements OnInit {
  authService = inject(AuthService);
  projetService = inject(ProjetService);
  ficheService = inject(FicheService);
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);

  user$ = this.authService.currentUser$;
  
  viewMode: 'grid' | 'list' = 'grid';
  mesProjets: Projet[] = [];
  recentFiches: FicheSuivi[] = [];

  showAddProjectModal = false;
  projectForm: FormGroup = this.fb.group({
    nomProjet: ['', Validators.required],
    description: ['', Validators.required],
    objectifs: [''],
    dateDebut: ['', Validators.required],
    dateFinPrevue: ['', Validators.required]
  });

  // Mocked for visual completeness requested in prompt
  kpis = {
    avancementMoyen: 68,
    fichesSoumisesMois: 12
  };
  
  history = [
    { action: 'Mise à jour Fiche #412', date: 'Il y a 2h', icon: 'edit' },
    { action: 'Création du projet Alpha', date: 'Hier', icon: 'add_circle' },
    { action: 'Nouveau commentaire sur Fiche #409', date: 'Hier', icon: 'comment' },
  ];

  ngOnInit() {
    this.loadProjets();
    this.loadFiches();
  }

  loadProjets() {
    const user = this.authService.currentUser;
    if (user?.id) {
      this.projetService.getMesProjets(user.id).subscribe({
        next: (res: Projet[]) => this.mesProjets = res || []
      });
    }
  }

  loadFiches() {
    // Current backend requires a projetId, for dashboard preview we'll skip or use empty
    this.recentFiches = [];
  }

  toggleView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  openAddProjectModal() {
    this.showAddProjectModal = true;
    this.projectForm.reset();
  }

  closeAddProjectModal() {
    this.showAddProjectModal = false;
  }

  submitProject() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    const user = this.authService.currentUser;
    if (!user) return;

    this.spinner.show();
    const newProjet: Projet = {
      ...this.projectForm.value,
      statut: 'NOUVEAU',
      chefDeProjet: { id: user.id, email: user.email, role: user.role || user.roles?.[0] }
    };

    this.projetService.create(newProjet).subscribe({
      next: (projet) => {
        this.spinner.hide();
        this.toastr.success('Projet créé avec succès');
        this.mesProjets.unshift(projet);
        this.closeAddProjectModal();
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Erreur lors de la création du projet');
      }
    });
  }
}
