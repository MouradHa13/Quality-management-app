import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectFormDialogComponent } from '../project-form-dialog/project-form-dialog.component';
import { FicheSuiviFormDialogComponent } from '../fiche-suivi-form-dialog/fiche-suivi-form-dialog.component';
import { ProjectStepperFormComponent } from '../project-stepper-form/project-stepper-form.component';
import { ProjetService } from '../../../services/projet.service';
import { FicheService } from '../../../services/fiche.service';
import { Projet, FicheSuivi } from '../../../models/projet.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTableModule, MatDialogModule, MatTooltipModule, ProjectStepperFormComponent],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent implements OnInit {
  private projetService = inject(ProjetService);
  private ficheService = inject(FicheService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private spinner = inject(NgxSpinnerService);
  projets: Projet[] = [];
  displayedColumns: string[] = ['nom', 'responsable', 'statut', 'actions'];
  
  showAddProjectModal = false;
  selectedProjectToEdit?: Projet;

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projetService.getAll().subscribe((data: Projet[]) => this.projets = data);
  }

  getStatusClass(statut: string) {
    if (!statut) return 'bg-slate-100 text-slate-700 font-bold';
    const s = statut.toLowerCase().replace(/_/g, ' ');
    if (s.includes('termine') || s.includes('cloture')) return 'bg-emerald-50 text-emerald-700 font-bold';
    if (s.includes('cours') || s.includes('active')) return 'bg-blue-50 text-blue-700 font-bold';
    if (s.includes('retard')) return 'bg-red-50 text-red-700 font-bold';
    return 'bg-slate-100 text-slate-700 font-bold';
  }

  viewProjectDetails(project: Projet) {
    if (project.id) {
      this.router.navigate(['/chef/projets', project.id]);
    }
  }

  openProjectForm(project?: Projet) {
    this.selectedProjectToEdit = project;
    this.showAddProjectModal = true;
  }

  closeAddProjectModal() {
    this.showAddProjectModal = false;
    this.selectedProjectToEdit = undefined;
  }

  onProjectStepperSubmitted(project: Projet) {
    this.spinner.show();
    const request = project.id 
      ? this.projetService.update(project.id, project)
      : this.projetService.create(project);

    request.subscribe({
      next: () => {
        this.spinner.hide();
        this.toastr.success(project.id ? 'Projet mis à jour' : 'Projet créé avec succès');
        this.loadProjects();
        this.closeAddProjectModal();
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Error saving project:', err);
        this.toastr.error('Erreur lors de l\'enregistrement');
      }
    });
  }

  deleteProject(projectId: string, event?: Event) {
    if (event) event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      this.spinner.show();
      this.projetService.delete(projectId).subscribe({
        next: () => {
          this.spinner.hide();
          this.toastr.success('Projet supprimé avec succès');
          this.loadProjects();
        },
        error: () => {
          this.spinner.hide();
          this.toastr.error('Erreur lors de la suppression');
        }
      });
    }
  }

  openFicheSuiviForm(project: Projet) {
    if (!project.id) return;
    
    const dialogRef = this.dialog.open(FicheSuiviFormDialogComponent, {
      width: '850px',
      maxWidth: '95vw',
      panelClass: 'modern-dialog',
      data: { project }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && project.id) {
        this.ficheService.addFicheSuivi(project.id, result).subscribe({
          next: () => {
            this.toastr.success('Fiche de suivi ajoutée avec succès');
            this.loadProjects();
          },
          error: () => this.toastr.error('Erreur lors de l\'ajout de la fiche')
        });
      }
    });
  }

  getProjectIcon(nom: string): string {
    const lowerNom = nom.toLowerCase();
    if (lowerNom.includes('iso')) return 'verified';
    if (lowerNom.includes('audit')) return 'fact_check';
    if (lowerNom.includes('lean') || lowerNom.includes('kaizen')) return 'trending_up';
    if (lowerNom.includes('digital')) return 'phishing';
    return 'assignment';
  }

  getProjectsByStatut(statut: string): Projet[] {
    const s = statut.toLowerCase().replace(/_/g, ' ');
    return this.projets.filter(p => {
      if (!p.statut) return false;
      const ps = p.statut.toLowerCase().replace(/_/g, ' ');
      if (s.includes('termine')) return ps.includes('termine') || ps.includes('cloture');
      if (s.includes('cours')) return ps.includes('cours') || ps.includes('active');
      if (s.includes('retard')) return ps.includes('retard');
      return ps === s;
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
