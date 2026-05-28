import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FicheTestService } from '../../../../services/fiche-test.service';
import { FicheTest } from '../../../../models/fiche-test.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-fiche-test-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './fiche-test-form.component.html',
  styleUrls: ['./fiche-test-form.component.css']
})
export class FicheTestFormComponent implements OnInit {
  @Input() projetId!: string;
  @Input() applicationName?: string;
  @Output() saved = new EventEmitter<FicheTest>();

  private fb = inject(FormBuilder);
  private ficheTestService = inject(FicheTestService);
  private toastr = inject(ToastrService);

  testForm!: FormGroup;
  isLoading = true;
  isSaving = false;

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.testForm = this.fb.group({
      id: [null],
      application: [this.applicationName || ''],
      version: [''],
      dateVersion: [''],
      architecture: ['Client/serveur'],
      dateDemandeEnvTest: [''],
      dateNoteServiceAffectation: [''],
      
      testFonctionnel: this.fb.group({
        responsable: [''],
        lignes: this.fb.array([])
      }),
      testSecurite: this.fb.group({
        responsable: [''],
        lignes: this.fb.array([])
      }),
      testQualite: this.fb.group({
        responsable: [''],
        lignes: this.fb.array([])
      }),

      responsableValidation: [''],
      signatureResponsable: [''],
      dateValidation: ['']
    });
  }

  getLignes(section: string): FormArray {
    return this.testForm.get(`${section}.lignes`) as FormArray;
  }

  addLigne(section: string) {
    const ligneGroup = this.fb.group({
      dateDebut: [''],
      dateFin: [''],
      valide: [false],
      observations: [''],
      signataire: ['']
    });
    this.getLignes(section).push(ligneGroup);
  }

  removeLigne(section: string, index: number) {
    this.getLignes(section).removeAt(index);
  }

  loadData() {
    this.ficheTestService.getFicheTestByProjet(this.projetId).subscribe({
      next: (data) => {
        if (data) {
          this.testForm.patchValue({
            ...data,
            dateVersion: this.formatDate(data.dateVersion),
            dateDemandeEnvTest: this.formatDate(data.dateDemandeEnvTest),
            dateNoteServiceAffectation: this.formatDate(data.dateNoteServiceAffectation),
            dateValidation: this.formatDate(data.dateValidation),
          });
          
          this.patchLignes('testFonctionnel', data.testFonctionnel?.lignes);
          this.patchLignes('testSecurite', data.testSecurite?.lignes);
          this.patchLignes('testQualite', data.testQualite?.lignes);
        } else {
          // Add one empty row to each section by default
          this.addLigne('testFonctionnel');
          this.addLigne('testSecurite');
          this.addLigne('testQualite');
        }
        this.isLoading = false;
      },
      error: () => {
        this.addLigne('testFonctionnel');
        this.addLigne('testSecurite');
        this.addLigne('testQualite');
        this.isLoading = false;
      }
    });
  }

  patchLignes(section: string, lignes: any[]) {
    if (!lignes || lignes.length === 0) {
      this.addLigne(section);
      return;
    }
    const formArray = this.getLignes(section);
    formArray.clear();
    lignes.forEach(l => {
      formArray.push(this.fb.group({
        dateDebut: [this.formatDate(l.dateDebut)],
        dateFin: [this.formatDate(l.dateFin)],
        valide: [l.valide],
        observations: [l.observations],
        signataire: [l.signataire]
      }));
    });
  }

  private formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.testForm.invalid) return;
    this.isSaving = true;
    
    this.ficheTestService.saveFicheTest(this.projetId, this.testForm.value).subscribe({
      next: (savedFiche) => {
        this.toastr.success('Fiche de test enregistrée avec succès');
        this.isSaving = false;
        this.saved.emit(savedFiche);
        this.testForm.patchValue({ id: savedFiche.id });
      },
      error: () => {
        this.toastr.error('Erreur lors de l\'enregistrement');
        this.isSaving = false;
      }
    });
  }
}
