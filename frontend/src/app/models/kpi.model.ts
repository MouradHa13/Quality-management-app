import { Utilisateur } from './utilisateur.model';
import { Projet } from './projet.model';

export interface KPI {
  id?: string;
  nomIndicateur: string;
  formule: string;
  periode: string;
  valeur: number;
}

export interface GlobalStats {
  totalUsers: number;
  totalProjets: number;
  totalFiches: number;
  notificationsEnvoyees: number;
  projetsEnRetard: number;
  tauxCompletionMoyen: number;
  kpiGlobalMoyen: number;
  usersByRole?: { admin: number, chef: number, pilote: number };
  projetsParMois?: number[];
}

export interface Notification {
  id?: string;
  destinataireId?: string;
  message: string;
  dateEnvoi: string | Date;
  type: string; // EMAIL, SMS
}

export interface Historique {
  id?: string;
  entiteModifiee: string;
  entiteId?: string;
  action: string;
  utilisateurId?: string;
  dateAction: string | Date;
  details: string;
}
