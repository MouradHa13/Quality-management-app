import { Component, EventEmitter, Output, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Projet } from '../../../models/projet.model';

@Component({
  selector: 'app-project-stepper-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './project-stepper-form.component.html',
  styleUrls: ['./project-stepper-form.component.css']
})
export class ProjectStepperFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() projectToEdit?: Projet;
  @Output() submitted = new EventEmitter<Projet>();
  @Output() cancelled = new EventEmitter<void>();

  // Simplified MVP Form Group
  projectForm = this.fb.group({
    id: [''],
    nomProjet: ['', Validators.required],
    designationClient: [''],
    typeProjet: ['Nouveau'],
    objectifs: [''],
    
    dateDebut: [new Date().toISOString().substring(0, 10), Validators.required],
    dateFinPrevue: [new Date().toISOString().substring(0, 10), Validators.required],
    statut: ['NOUVEAU', Validators.required],
    avancement: [0, [Validators.min(0), Validators.max(100)]],
    
    equipePrincipale: [''],
    risquesPotentiels: ['']
  });

  ngOnInit() {
    if (this.projectToEdit) {
      this.projectForm.patchValue({
        id: this.projectToEdit.id || '',
        nomProjet: this.projectToEdit.nomProjet,
        designationClient: this.projectToEdit.details?.designationClient || '',
        typeProjet: this.projectToEdit.details?.typeProjet || 'Nouveau',
        objectifs: this.projectToEdit.objectifs || '',
        
        dateDebut: this.formatDate(this.projectToEdit.dateDebut),
        dateFinPrevue: this.formatDate(this.projectToEdit.dateFinPrevue),
        statut: this.projectToEdit.statut || 'NOUVEAU',
        avancement: this.projectToEdit.avancement ?? 0,
        
        // Join MVP array to string for easy display
        equipePrincipale: this.projectToEdit.details?.equipeProjet?.join(', ') || '',
        risquesPotentiels: this.projectToEdit.details?.risquesPotentiels || ''
      });
    }
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().substring(0, 10);
  }



  onSubmit() {
    if (this.projectForm.valid) {
      const val = this.projectForm.value;
      const projet: Projet = {
        id: val.id || undefined,
        nomProjet: val.nomProjet!,
        description: val.objectifs || '',
        objectifs: val.objectifs || '',
        dateDebut: new Date(val.dateDebut!),
        dateFinPrevue: new Date(val.dateFinPrevue!),
        statut: val.statut || 'NOUVEAU',
        avancement: Number(val.avancement) || 0,
        details: {
          designationClient: val.designationClient || '',
          typeProjet: val.typeProjet || 'Nouveau',
          equipeProjet: val.equipePrincipale ? val.equipePrincipale.split(',').map((s: string) => s.trim()) : [],
          risquesPotentiels: val.risquesPotentiels || '',
          // Preserve empty arrays for old models if they exist
          estimationCharges: this.projectToEdit?.details?.estimationCharges || [],
          estimationBudgets: this.projectToEdit?.details?.estimationBudgets || [],
          planningActions: this.projectToEdit?.details?.planningActions || []
        }
      };
      this.submitted.emit(projet);
    }
  }

  onCancel() {
    this.cancelled.emit();
  }
}
