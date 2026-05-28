export interface User {
  id: string;
  nom: string;
  email: string;
  roles: string[];
}

export interface Project {
  id?: string;
  nomProjet: string;
  description: string;
  objectifs: string;
  dateDebut: string | Date;
  dateFinPrevue: string | Date;
  statut: string;
  avancement?: number;
  kpiGlobal?: number;
  fichesSuivi?: FicheSuivi[];
  chefDeProjet?: User | { id: string; nom?: string; email?: string };
}

import { FicheSuivi as ProjetFicheSuivi } from '../../models/projet.model';

export interface FicheSuivi extends ProjetFicheSuivi {}

export interface KPI {
  id: string;
  nomIndicateur: string;
  formule: string;
  periode: string;
  valeur: number;
}

export interface Historique {
  id: string;
  action: string;
  entiteConcernee: string;
  auteur: string;
  dateAction: string;
  details: string;
}

export interface Nomenclature {
  id?: string;
  typeStructure: string;
  nomStructure: string;
  description?: string;
}
