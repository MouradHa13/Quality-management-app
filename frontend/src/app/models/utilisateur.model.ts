export enum RoleNom {
  ADMIN = 'ADMIN',
  CHEF_PROJET = 'CHEF_PROJET',
  PILOTE_QUALITE = 'PILOTE_QUALITE'
}

export interface Role {
  id?: string;
  nomRole: RoleNom;
  permissions?: string[];
}

export interface Utilisateur {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string;
   role?: Role;
   roles?: Role[];
  actif: boolean;
  lastSeen?: Date;
  dateCreation?: Date;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: string;
  email: string;
  roles: string[]; // Backend returns a string array of roles
}

export interface Nomenclature {
  id?: string;
  nomStructure: string;
  typeStructure: string; // ROLE, STATUT, ETAPE, etc.
  description: string;
  parent?: string;
  actif: boolean;
}

import { FicheSuivi as ProjetFicheSuivi } from './projet.model';

export interface FicheSuivi extends ProjetFicheSuivi {
  projetNom?: string;
}
