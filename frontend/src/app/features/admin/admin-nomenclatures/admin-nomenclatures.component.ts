import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NomenclatureService } from '../../../services/nomenclature.service';
import { Nomenclature } from '../../../core/models/app.models';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-nomenclatures',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-nomenclatures.component.html'
})
export class AdminNomenclaturesComponent implements OnInit {
  private nomenclatureService = inject(NomenclatureService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  nomenclatures: Nomenclature[] = [];
  selectedType = '';
  types = ['ROLE', 'STATUT', 'TYPE_PROJET', 'STATUT_PROJET', 'TYPE_NOTIFICATION'];
  
  showAddModal = false;
  isEditMode = false;
  editId: any = null;
  nomForm: FormGroup = this.fb.group({
    code: ['', Validators.required],
    libelle: ['', Validators.required],
    categorie: ['TYPE_PROJET', Validators.required],
    description: ['']
  });

  ngOnInit() {
    this.loadNomenclatures();
  }

  loadNomenclatures() {
    const obs = this.selectedType 
      ? this.nomenclatureService.getByType(this.selectedType)
      : this.nomenclatureService.getAll();
      
    obs.subscribe({
      next: (data) => this.nomenclatures = data
    });
  }

  openAddModal() {
    this.showAddModal = true;
    this.isEditMode = false;
    this.editId = null;
    this.nomForm.reset({ categorie: 'TYPE_PROJET' });
  }

  openEditModal(nom: Nomenclature) {
    this.showAddModal = true;
    this.isEditMode = true;
    this.editId = nom.id;
    this.nomForm.patchValue({
      code: nom.nomStructure,
      libelle: nom.description,
      categorie: nom.typeStructure,
      description: nom.description
    });
  }

  closeModal() {
    this.showAddModal = false;
    this.isEditMode = false;
    this.editId = null;
  }

  saveNomenclature() {
    if (this.nomForm.invalid) return;
    const payload = {
      typeStructure: this.nomForm.value.categorie,
      nomStructure: this.nomForm.value.code,
      description: this.nomForm.value.libelle // logic mapping libelle to desc if needed
    } as any;
    if (this.isEditMode && this.editId) {
      this.nomenclatureService.update(this.editId, payload).subscribe({
        next: () => {
          this.toastr.success('Nomenclature modifiée');
          this.loadNomenclatures();
          this.closeModal();
        },
        error: () => this.toastr.error('Erreur lors de la modification')
      });
    } else {
      this.nomenclatureService.create(payload).subscribe({
        next: () => {
          this.toastr.success('Nomenclature ajoutée');
          this.loadNomenclatures();
          this.closeModal();
        },
        error: () => this.toastr.error('Erreur lors de l\'ajout')
      });
    }
  }

  deleteNomenclature(id: number) {
   
    this.nomenclatureService.delete(id).subscribe({
      next: () => {
        this.toastr.success('Nomenclature supprimée');
        this.loadNomenclatures();
      },
      error: () => this.toastr.error('Erreur lors de la suppression')
    });
  }
}
