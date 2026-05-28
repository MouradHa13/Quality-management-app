export enum Role {
  ADMIN = 'ADMIN',
  CHEF_PROJET = 'CHEF_PROJET',
  PILOTE_QUALITE = 'PILOTE_QUALITE'
}

export interface AuthResponse {
  token: string;
  type: string;
  id: string;
  email: string;
  roles: string[];
}

export interface User {
  id?: string;
  nom?: string;
  prenom?: string;
  email: string;
  role: Role;
  type?: string; 
  actif?: boolean;
}

export interface Nomenclature {
  id?: string;
  nomStructure: string;
  typeStructure: string;
  description?: string;
}

