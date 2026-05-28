import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ProjetService } from '../../../services/projet.service';
import { FicheService } from '../../../services/fiche.service';
import { Projet, FicheSuivi } from '../../../models/projet.model';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

import { ProjectStepperFormComponent } from '../../projects/project-stepper-form/project-stepper-form.component';

@Component({
  selector: 'app-chef-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ProjectStepperFormComponent],
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
  searchTerm: string = '';

  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement.value || '';
  }

  get filteredProjets(): Projet[] {
    if (!this.searchTerm.trim()) {
      return this.mesProjets;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.mesProjets.filter(p => 
      p.nomProjet.toLowerCase().includes(term) || 
      (p.description && p.description.toLowerCase().includes(term)) ||
      (p.statut && p.statut.toLowerCase().includes(term))
    );
  }

  form!: FormGroup;

  showAddProjectModal = false;
  selectedProjectToEdit?: Projet;

  // Dynamically calculated KPIs
  kpis = {
    avancementMoyen: 0,
    fichesSoumisesMois: 0,
    anomaliesActives: 0
  };
  
  projectAnomalies: { [projectId: string]: number } = {};
  
  history: any[] = [];

  ngOnInit() {
    this.loadProjets();
    this.form = this.fb.group({
      projetId: ['', Validators.required],
      sujetFiche: ['', Validators.required]
    });
  }

  loadProjets() {
    this.projetService.getAll().subscribe({
      next: (res: Projet[]) => {
        this.mesProjets = res || [];
        this.calculateKPIs();
        this.loadRecentFiches();
      }
    });
  }

  calculateKPIs() {
    if (this.mesProjets.length === 0) {
      this.kpis = { avancementMoyen: 0, fichesSoumisesMois: 0, anomaliesActives: 0 };
      return;
    }

    // 1. Average Progress
    const totalAvancement = this.mesProjets.reduce((acc, p) => acc + (p.avancement || 0), 0);
    this.kpis.avancementMoyen = Math.round(totalAvancement / this.mesProjets.length);
  }

  loadRecentFiches() {
    // Fetch fiches for all projects to calculate stats
    this.recentFiches = [];
    this.projectAnomalies = {};
    this.kpis.anomaliesActives = 0;

    this.mesProjets.forEach(p => {
      if (p.id) {
        this.ficheService.getFichesSuiviByProjet(p.id).subscribe((fiches: FicheSuivi[]) => {
          const safeFiches = fiches || [];
          
          // Count active anomalies for this project
          const activeAnomalies = safeFiches.filter(f => f.natureDemande === 'ANOMALIE' && f.statut === 'EN_COURS').length;
          this.projectAnomalies[p.id!] = activeAnomalies;
          
          // Recalculate total active anomalies across all projects
          this.kpis.anomaliesActives = Object.values(this.projectAnomalies).reduce((acc, val) => acc + val, 0);

          this.recentFiches = [...this.recentFiches, ...safeFiches];
          this.recentFiches.sort((a, b) => new Date(b.dateSaisie!).getTime() - new Date(a.dateSaisie!).getTime());
          this.recentFiches = this.recentFiches.slice(0, 5); // Keep last 5
          this.kpis.fichesSoumisesMois = this.recentFiches.length; // Simplified for now
          
          // Generate history from fiches
          this.history = this.recentFiches.map(f => ({
            action: `Mise à jour: ${f.sujet}`,
            date: new Date(f.dateSaisie!).toLocaleDateString(),
            icon: 'description'
          }));
        });
      }
    });
  }

  loadFiches() {
    // Handled in loadRecentFiches
  }

  toggleView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  openAddProjectModal() {
    this.selectedProjectToEdit = undefined;
    this.showAddProjectModal = true;
  }

  editProject(projet: Projet, event?: Event) {
    if (event) event.stopPropagation();
    this.selectedProjectToEdit = projet;
    this.showAddProjectModal = true;
  }

  deleteProject(projetId: string, event?: Event) {
    if (event) event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      this.spinner.show();
      this.projetService.delete(projetId).subscribe({
        next: () => {
          this.spinner.hide();
          this.toastr.success('Projet supprimé avec succès');
          this.mesProjets = this.mesProjets.filter(p => p.id !== projetId);
        },
        error: () => {
          this.spinner.hide();
          this.toastr.error('Erreur lors de la suppression');
        }
      });
    }
  }

  closeAddProjectModal() {
    this.showAddProjectModal = false;
    this.selectedProjectToEdit = undefined;
  }
  
  onProjectStepperSubmitted(projet: Projet) {
    const user = this.authService.currentUser;
    if (!user) return;

    this.spinner.show();
    const finalProjet: Projet = {
      ...projet,
      chefDeProjet: { id: user.id! }
    };

    const request = projet.id 
      ? this.projetService.update(projet.id, finalProjet)
      : this.projetService.create(finalProjet);

    request.subscribe({
      next: (res) => {
        this.spinner.hide();
        this.toastr.success(projet.id ? 'Projet mis à jour' : 'Projet créé avec succès');
        if (projet.id) {
          const index = this.mesProjets.findIndex(p => p.id === projet.id);
          if (index !== -1) this.mesProjets[index] = res;
        } else {
          this.mesProjets.unshift(res);
        }
        this.closeAddProjectModal();
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Error saving project:', err);
        this.toastr.error('Erreur lors de l\'enregistrement');
      }
    });
  }

  submitFiche() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Veuillez sélectionner un projet et saisir un sujet');
      return;
    }

    const projetId = this.form.value.projetId;
    this.spinner.show();

    const fiche: FicheSuivi = {
      sujet: this.form.value.sujetFiche,
      avancement: 0,
      dateSaisie: null,
      statut: 'EN_COURS',
      problemes: '',
      decisions: '',
      indicateurs: ''
    };

    this.ficheService.addFicheSuivi(projetId, fiche).subscribe({
      next: (res) => {
        this.spinner.hide();
        this.toastr.success('Fiche de suivi créée avec succès');
        this.recentFiches.unshift(res);
        this.form.reset({ projetId: '', sujetFiche: '' });
        this.loadProjets();
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error('Erreur lors de la création de la fiche');
      }
    });
  }

  getDisplayProgress(project: Projet): { percentage: number, label: string, colorClass: string, textClass: string } {
    const s = project.statut?.toLowerCase().replace(/_/g, ' ') || '';
    if (s.includes('termine') || s.includes('cloture')) {
      return { percentage: 100, label: 'Projet Achevé', colorClass: 'from-emerald-400 to-emerald-500 shadow-emerald-500/40', textClass: 'text-emerald-500' };
    }
    if (s.includes('retard')) {
      return { percentage: project.avancement || 0, label: 'En Souffrance', colorClass: 'from-red-400 to-rose-500 shadow-red-500/40', textClass: 'text-red-500' };
    }
    const av = project.avancement || 0;
    let label = 'En Développement';
    if (av === 0) label = 'Non Démarré';
    else if (av >= 75) label = 'Phase de Finalisation';
    
    return { percentage: av, label, colorClass: 'from-primary to-accent shadow-glow-primary', textClass: 'text-primary' };
  }
}