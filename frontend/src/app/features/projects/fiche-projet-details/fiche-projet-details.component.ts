import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjetService } from '../../../services/projet.service';
import { Project } from '../../../core/models/app.models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ProjectFormDialogComponent } from '../project-form-dialog/project-form-dialog.component';
import jsPDF from 'jspdf';
import { ProjectPrintViewComponent } from '../project-print-view/project-print-view.component';
import { FicheTestFormComponent } from '../fiche-test/fiche-test-form/fiche-test-form.component';
import { FicheTestPrintComponent } from '../fiche-test/fiche-test-print/fiche-test-print.component';
import { FicheTestService } from '../../../services/fiche-test.service';
import { FicheTest } from '../../../models/fiche-test.model';
import { FicheService } from '../../../services/fiche.service';
import { FicheSuiviFormDialogComponent } from '../fiche-suivi-form-dialog/fiche-suivi-form-dialog.component';
import { FicheSuiviPrintComponent } from '../fiche-suivi-print/fiche-suivi-print.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-fiche-projet-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule, ProjectPrintViewComponent, FicheTestFormComponent, FicheTestPrintComponent, FicheSuiviFormDialogComponent, FicheSuiviPrintComponent],
  templateUrl: './fiche-projet-details.component.html'
})
export class FicheProjetDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projetService = inject(ProjetService);
  private ficheTestService = inject(FicheTestService);
  private ficheService = inject(FicheService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);
  @ViewChild(FicheTestFormComponent) ficheTestFormComponent?: FicheTestFormComponent;
  
  currentUserRole: any;
  
  projet?: Project;
  ficheTest?: FicheTest;
  activeTab: 'dashboard' | 'ficheTest' = 'dashboard';
  selectedFicheSuiviToPrint?: any;
  aiAnalysis: { status: 'loading' | 'done', type: 'good' | 'warning' | 'neutral', message: string } | null = null;

  ngOnInit() {
    this.currentUserRole = this.authService.getCurrentUserRole();
    this.loadProjectDetails();
  }

  loadProjectDetails() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projetService.getById(id).subscribe((data: Project) => {
        this.projet = data;
        this.loadFicheTest(id);
        this.generateAIAnalysis(data);
      });
    }
  }

  generateAIAnalysis(projet: Project) {
    this.aiAnalysis = { status: 'loading', type: 'neutral', message: '' };
    
    // Simulate AI loading/thinking
    setTimeout(() => {
      let type: 'good' | 'warning' | 'neutral' = 'neutral';
      let message = '';
      const avancement = projet.avancement || 0;
      
      const now = new Date().getTime();
      const end = new Date(projet.dateFinPrevue).getTime();
      const start = new Date(projet.dateDebut).getTime();
      
      const totalDuration = end - start;
      const elapsed = now - start;
      const timeProgress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 100;
      
      if (avancement >= 100) {
        type = 'good';
        message = "Ce projet est marqué comme terminé. Les objectifs semblent atteints.";
      } else if (timeProgress > 90 && avancement < 80) {
        type = 'warning';
        message = `Attention : La date de fin est proche (le délai est consommé à ${Math.min(timeProgress, 100).toFixed(0)}%) mais l'avancement n'est que de ${avancement}%. Un risque de dépassement de délai est fort probable.`;
      } else if (avancement > timeProgress + 10) {
        type = 'good';
        message = "Excellente dynamique : l'avancement du projet est en avance sur le planning prévisionnel.";
      } else if (projet.fichesSuivi && projet.fichesSuivi.length > 3 && avancement < 30) {
         type = 'warning';
         message = "Plusieurs actions de maintenance ont été ouvertes, mais l'avancement global reste faible. Une réévaluation des blocages techniques est suggérée.";
      } else {
        type = 'neutral';
        message = "L'évolution du projet semble cohérente avec le temps écoulé. Continuez à tracer vos actions de maintenance pour maintenir ce rythme.";
      }

      if ((!projet.fichesSuivi || projet.fichesSuivi.length === 0) && avancement > 20) {
         message += " 💡 Conseil : Pensez à enregistrer vos actions dans le journal de bord pour justifier cet avancement.";
      }

      this.aiAnalysis = { status: 'done', type, message };
    }, 2500); // 2.5s simulation
  }

  loadFicheTest(projetId: string) {
    this.ficheTestService.getFicheTestByProjet(projetId).subscribe({
      next: (data) => {
        if (data) {
          this.ficheTest = data;
        }
      },
      error: () => {
        // Not found, will be created later
      }
    });
  }

  setTab(tab: 'dashboard' | 'ficheTest') {
    this.activeTab = tab;
  }

  onFicheTestSaved(ficheTest: FicheTest) {
    this.ficheTest = ficheTest;
  }

  getPrintableFicheTest(): FicheTest {
    const liveData = this.ficheTestFormComponent?.testForm?.value;
    if (liveData) {
      return {
        ...this.ficheTest,
        ...liveData,
        testFonctionnel: {
          responsable: liveData.testFonctionnel?.responsable || '',
          lignes: liveData.testFonctionnel?.lignes || []
        },
        testSecurite: {
          responsable: liveData.testSecurite?.responsable || '',
          lignes: liveData.testSecurite?.lignes || []
        },
        testQualite: {
          responsable: liveData.testQualite?.responsable || '',
          lignes: liveData.testQualite?.lignes || []
        }
      };
    }

    return this.ficheTest || {
      id: '',
      projetId: this.projet?.id || '',
      application: this.projet?.nomProjet || '',
      version: '',
      dateVersion: undefined,
      architecture: 'Client/serveur',
      dateDemandeEnvTest: undefined,
      dateNoteServiceAffectation: undefined,
      testFonctionnel: { responsable: '', lignes: [] },
      testSecurite: { responsable: '', lignes: [] },
      testQualite: { responsable: '', lignes: [] },
      responsableValidation: '',
      signatureResponsable: '',
      dateValidation: undefined
    };
  }

  openAddFicheSuivi() {
    if (!this.projet) return;
    
    const dialogRef = this.dialog.open(FicheSuiviFormDialogComponent, {
      width: '850px',
      maxWidth: '95vw',
      panelClass: 'modern-dialog',
      data: { project: this.projet }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && this.projet?.id) {
        this.ficheService.addFicheSuivi(this.projet.id, result).subscribe({
          next: () => {
            this.toastr.success('Fiche de suivi ajoutée avec succès');
            this.loadProjectDetails();
          },
          error: () => this.toastr.error('Erreur lors de l\'ajout de la fiche')
        });
      }
    });
  }

  openEditFicheSuivi(fiche: any) {
    if (!this.projet) return;
    
    const dialogRef = this.dialog.open(FicheSuiviFormDialogComponent, {
      width: '850px',
      maxWidth: '95vw',
      panelClass: 'modern-dialog',
      data: { project: this.projet, ficheToEdit: fiche }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && fiche.id) {
        this.ficheService.updateFicheSuivi(fiche.id, result).subscribe({
          next: () => {
            this.toastr.success('Fiche de suivi mise à jour avec succès');
            this.loadProjectDetails();
          },
          error: () => this.toastr.error('Erreur lors de la mise à jour de la fiche')
        });
      }
    });
  }

  getTestStatus(ficheSuivi: any): { label: string, colorClass: string, icon: string } {
    if (!ficheSuivi.versionCible) {
      return { label: 'Sans Version', colorClass: 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-white/5 dark:text-gray-400', icon: 'tag' };
    }
    
    if (this.ficheTest && this.ficheTest.version === ficheSuivi.versionCible) {
      if (this.ficheTest.dateValidation) {
        return { label: 'Validée', colorClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', icon: 'check_circle' };
      } else {
        return { label: 'En Cours de Test', colorClass: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', icon: 'pending' };
      }
    }
    
    return { label: 'Aucun Test', colorClass: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20', icon: 'cancel' };
  }

  goToTestForVersion(version: string) {
    this.activeTab = 'ficheTest';
    // If the test form is loaded, we can dynamically suggest or patch the version!
    setTimeout(() => {
      if (this.ficheTestFormComponent && this.ficheTestFormComponent.testForm) {
        const currentVersion = this.ficheTestFormComponent.testForm.get('version')?.value;
        if (!currentVersion || currentVersion !== version) {
          if (confirm(`Voulez-vous initialiser la Fiche de Test pour la version ${version} ?`)) {
            this.ficheTestFormComponent.testForm.patchValue({
              version: version
            });
            this.toastr.info(`Version cible mise à jour à ${version} dans la Fiche de Test`);
          }
        }
      }
    }, 100);
  }

  goBack() {
    if (this.currentUserRole === 'PILOTE_QUALITE') {
      this.router.navigate(['/pilote/fiches']);
    } else {
      this.router.navigate(['/chef/projets']);
    }
  }

  getStatusClass(statut: string) {
    if (!statut) return 'bg-slate-100 text-slate-700 font-bold';
    const s = statut.toLowerCase().replace(/_/g, ' ');
    if (s.includes('termine') || s.includes('cloture')) return 'bg-emerald-50 text-emerald-700 font-bold';
    if (s.includes('cours') || s.includes('active')) return 'bg-blue-50 text-blue-700 font-bold';
    if (s.includes('retard')) return 'bg-red-50 text-red-700 font-bold';
    return 'bg-slate-100 text-slate-700 font-bold';
  }

  printFiche() {
    window.print();
  }

exportProjectDetails() {
  if (!this.projet) return;

  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;
  const margin = 15;
  const maxWidth = pageWidth - (margin * 2);
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Détails du Projet', margin, yPosition);
  
  yPosition += 15;
  
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;
  
  const addField = (label: string, value: any) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`${label}:`, margin, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const text = String(value || '-');
    const lines = doc.splitTextToSize(text, maxWidth - 60);
    doc.text(lines, margin + 60, yPosition);
    
    yPosition += (lines.length * 5) + 8;
  };
  
  addField('Nom du Projet', this.projet.nomProjet);
  addField('Description', this.projet.description);
  addField('Objectifs', this.projet.objectifs);
  addField('Date de Début', new Date(this.projet.dateDebut).toLocaleDateString('fr-FR'));
  addField('Date Fin Prévue', new Date(this.projet.dateFinPrevue).toLocaleDateString('fr-FR'));
  addField('Statut', this.projet.statut);
  
  yPosition += 10;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, margin, pageHeight - 10);
  
  doc.save(`projet-${this.projet.nomProjet}-${new Date().toISOString().split('T')[0]}.pdf`);
  this.toastr.success('Projet exporté en PDF avec succès');
}

  editProject() {
    if (!this.projet) return;
    
    const dialogRef = this.dialog.open(ProjectFormDialogComponent, {
      width: '650px',
      maxWidth: '95vw',
      panelClass: ['modern-dialog', 'overflow-hidden'],
      data: { project: this.projet },
      autoFocus: 'first-tabbable',
      restoreFocus: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && this.projet?.id) {
        this.projetService.update(this.projet.id, result).subscribe({
          next: () => {
            this.toastr.success('Projet mis à jour avec succès');
            this.loadProjectDetails();
          },
          error: () => this.toastr.error('Erreur lors de la mise à jour du projet')
        });
      }
    });
  }

  printFicheSuivi(fiche: any) {
    this.selectedFicheSuiviToPrint = fiche;
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        this.selectedFicheSuiviToPrint = null;
      }, 1000);
    }, 100);
  }
}
