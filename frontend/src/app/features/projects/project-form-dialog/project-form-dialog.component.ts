import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Project } from '../../../core/models/app.models';

@Component({
  selector: 'app-project-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatIconModule, MatSelectModule],
  templateUrl: './project-form-dialog.component.html'
})
export class ProjectFormDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProjectFormDialogComponent>);

  projectForm = this.fb.group({
    nomProjet: ['', Validators.required],
    description: ['', Validators.required],
    objectifs: ['', Validators.required],
    dateDebut: [new Date().toISOString().substring(0, 10), Validators.required],
    dateFinPrevue: [new Date().toISOString().substring(0, 10), Validators.required],
    statut: ['NOUVEAU', Validators.required]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { project?: Project }) {
    if (data.project) {
      this.projectForm.patchValue({
        ...data.project,
        dateDebut: new Date(data.project.dateDebut).toISOString().substring(0, 10),
        dateFinPrevue: new Date(data.project.dateFinPrevue).toISOString().substring(0, 10)
      } as any);
    }
  }

  onSave() {
    if (this.projectForm.valid) {
      const val = this.projectForm.value;
      const res = {
        ...val,
        dateDebut: new Date(val.dateDebut!),
        dateFinPrevue: new Date(val.dateFinPrevue!)
      };
      this.dialogRef.close(res);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
