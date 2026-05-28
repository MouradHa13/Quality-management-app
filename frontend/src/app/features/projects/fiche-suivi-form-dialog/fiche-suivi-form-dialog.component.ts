import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Projet } from '../../../models/projet.model';

@Component({
  selector: 'app-fiche-suivi-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './fiche-suivi-form-dialog.component.html',
  styleUrls: ['./fiche-suivi-form-dialog.component.css']
})
export class FicheSuiviFormDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FicheSuiviFormDialogComponent>);

  natureDemandes = [
    { value: 'ANOMALIE', label: 'Anomalie', icon: 'bug_report' },
    { value: 'AMELIORATION', label: 'Amélioration', icon: 'trending_up' },
    { value: 'NOUVEAU_BESOIN', label: 'Nouveau Besoin', icon: 'add_circle' }
  ];
  ficheForm = this.fb.group({
    // Compatibility fields (consumed by timeline/dashboard)
    sujet: [''],
    avancement: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    problemes: [''],
    decisions: [''],
    observations: [''],
    statut: ['EN_COURS'],

    // Section 1 - Signalement & Décision
    demandeur: [''],
    natureDemande: ['ANOMALIE'],
    descriptionProbleme: [''],
    versionCible: ['', Validators.required],
    decisionRMAP: [true],
    dateDecisionRMAP: [new Date().toISOString().substring(0, 10)],

    // Section 2 - Travaux & Clôture
    objetCompteRendu: [''],
    comporteSource: [false],
    comporteExecutable: [false],
    comporteDocumentation: [false],
    dateFinTravaux: [''],
    observationCloture: ['']
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { project: Projet, ficheToEdit?: any }) {
    if (data.ficheToEdit) {
      const f = { ...data.ficheToEdit };
      // Format any date fields
      if (f.dateDecisionRMAP) {
        try { f.dateDecisionRMAP = new Date(f.dateDecisionRMAP).toISOString().substring(0, 10); } catch(e) { f.dateDecisionRMAP = ''; }
      }
      if (f.dateFinTravaux) {
        try { f.dateFinTravaux = new Date(f.dateFinTravaux).toISOString().substring(0, 10); } catch(e) { f.dateFinTravaux = ''; }
      }
      this.ficheForm.patchValue(f);
    }
  }

  onSave() {
    if (this.ficheForm.valid) {
      const val = { ...this.ficheForm.value } as any;

      // Sync compatibility fields for timeline/dashboard
      val.sujet = val.objetCompteRendu || `Version ${val.versionCible}`;
      val.problemes = val.descriptionProbleme || 'Aucun problème signalé.';
      val.decisions = val.observationCloture || '';
      val.observations = val.observationCloture || '';

      const formatDate = (dateStr: string | null | undefined): string | null => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        const pad = (n: number, s = 2) => n.toString().padStart(s, '0');
        const offset = -d.getTimezoneOffset();
        const sign = offset >= 0 ? '+' : '-';
        const abs = Math.abs(offset);
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}${sign}${pad(Math.floor(abs/60))}${pad(abs%60)}`;
      };

      val.dateDecisionRMAP = formatDate(val.dateDecisionRMAP);
      val.dateFinTravaux = formatDate(val.dateFinTravaux);
      if (!val.dateSaisie) val.dateSaisie = null;

      this.dialogRef.close(val);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
