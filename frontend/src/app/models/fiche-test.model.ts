export interface LigneTest {
  dateDebut?: string | Date;
  dateFin?: string | Date;
  valide?: boolean;
  observations?: string;
  signataire?: string;
}

export interface TestSection {
  responsable?: string;
  lignes: LigneTest[];
}

export interface FicheTest {
  id?: string;
  application?: string;
  version?: string;
  dateVersion?: string | Date;
  architecture?: string;
  dateDemandeEnvTest?: string | Date;
  dateNoteServiceAffectation?: string | Date;
  
  testFonctionnel: TestSection;
  testSecurite: TestSection;
  testQualite: TestSection;
  [key: string]: any; // Allow dynamic property access
  
  responsableValidation?: string;
  signatureResponsable?: string;
  dateValidation?: string | Date;
  
  projetId?: string;
}
