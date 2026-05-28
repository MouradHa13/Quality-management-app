import { Component, OnInit, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FicheService } from '../../../services/fiche.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoleNom } from '../../../models/utilisateur.model';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FicheSuiviFormDialogComponent } from '../../projects/fiche-suivi-form-dialog/fiche-suivi-form-dialog.component';
import { ProjetService } from '../../../services/projet.service';

@Component({
  selector: 'app-fiche-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
  templateUrl: './fiche-list.component.html'
})
export class FicheListComponent implements OnInit {
  private ficheService = inject(FicheService);
  private authService = inject(AuthService);
  private projetService = inject(ProjetService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);

  fiches: any[] = [];
  groupedProjects: { 
    projetId: string;
    projetNom: string;
    statut?: string;
    avancementGlobal: number;
    realProject?: any;
    fiches: any[];
    isExpanded: boolean;
  }[] = [];
  
  isLoading = true;
  currentUserRole!: any;

  ngOnInit() {
    this.currentUserRole = this.authService.getCurrentUserRole();
    this.loadFiches();
  }

  loadFiches() {
    this.isLoading = true;
    forkJoin({
      fiches: this.ficheService.getAllFichesSuivi().pipe(catchError(() => of([]))),
      projects: this.projetService.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: (results) => {
        const projectMap = new Map();
        (results.projects || []).forEach((p: any) => projectMap.set(p.id, p));
        
        this.fiches = results.fiches || [];
        this.groupFichesByProject(projectMap);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  groupFichesByProject(projectMap: Map<string, any>) {
    const groups: { [key: string]: any } = {};
    
    this.fiches.forEach(fiche => {
      const pId = fiche.projetId || 'unknown';
      const realProject = projectMap.get(pId);
      
      const pNom = realProject?.nomProjet || fiche.projetNom || 'Projet non spécifié';
      const pStatut = realProject?.statut || 'N/A';
      
      if (!groups[pId]) {
        groups[pId] = {
          projetId: pId,
          projetNom: pNom,
          statut: pStatut,
          avancementGlobal: realProject?.avancement || 0,
          realProject: realProject,
          fiches: [],
          isExpanded: false
        };
      }
      groups[pId].fiches.push(fiche);
    });
    
    this.groupedProjects = Object.values(groups);
    
    this.groupedProjects.forEach(group => {
      group.fiches.sort((a: any, b: any) => new Date(b.dateSaisie).getTime() - new Date(a.dateSaisie).getTime());
      if (!group.realProject && group.fiches.length > 0) {
        group.avancementGlobal = group.fiches[0].avancement || 0;
      }
    });
  }

  getDisplayProgress(group: any): { percentage: number, label: string, colorClass: string, textClass: string } {
    const s = group.statut?.toLowerCase().replace(/_/g, ' ') || '';
    if (s.includes('termine') || s.includes('cloture')) {
      return { percentage: 100, label: 'Projet Achevé', colorClass: 'from-emerald-400 to-emerald-500 shadow-emerald-500/40', textClass: 'text-emerald-500' };
    }
    if (s.includes('retard')) {
      return { percentage: group.avancementGlobal || 0, label: 'En Souffrance', colorClass: 'from-red-400 to-rose-500 shadow-red-500/40', textClass: 'text-red-500' };
    }
    const av = group.avancementGlobal || 0;
    let label = 'En Développement';
    if (av === 0) label = 'Non Démarré';
    else if (av >= 75) label = 'Phase de Finalisation';
    
    return { percentage: av, label, colorClass: 'from-primary to-accent shadow-glow-primary', textClass: 'text-primary' };
  }

  toggleProject(group: any) {
    group.isExpanded = !group.isExpanded;
  }

  getStatusColor(avancement: number): string {
    if (avancement >= 90) return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30';
    if (avancement >= 50) return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30';
    return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30';
  }

  viewDetails(fiche: any) {
    if (!fiche.projetId) return;
    const role = this.authService.getCurrentUserRole();
    if (role === RoleNom.CHEF_PROJET) {
      this.router.navigate(['/chef/projets', fiche.projetId]);
    } else if (role === RoleNom.PILOTE_QUALITE) {
      this.router.navigate(['/pilote/projets', fiche.projetId]);
    } else {
      console.log('View details not fully implemented for role:', role);
    }
  }

  editFiche(fiche: any) {
    this.projetService.getById(fiche.projetId).subscribe(project => {
      const dialogRef = this.dialog.open(FicheSuiviFormDialogComponent, {
        width: '850px',
        maxWidth: '95vw',
        panelClass: 'modern-dialog',
        data: { project, ficheToEdit: fiche }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && fiche.id) {
          this.ficheService.updateFicheSuivi(fiche.id, result).subscribe({
            next: () => {
              this.toastr.success('Fiche de suivi mise à jour');
              this.loadFiches();
            },
            error: () => this.toastr.error('Erreur lors de la mise à jour')
          });
        }
      });
    });
  }

  deleteFiche(ficheId: string) {
    if (confirm('Voulez-vous supprimer ce suivi ?')) {
      this.ficheService.deleteFicheSuivi(ficheId).subscribe({
        next: () => {
          this.toastr.success('Suivi supprimé');
          this.loadFiches();
        },
        error: () => this.toastr.error('Erreur lors de la suppression')
      });
    }
  }
}
