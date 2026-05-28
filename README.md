# 🌟 Application de Suivi des Processus Qualité (TextQualite)

Bienvenue dans le dépôt du projet **TextQualite**, une plateforme full-stack moderne pour le suivi, la gestion et l'évaluation des processus qualité et des fiches de suivi, adaptée au contexte tunisien.

---

## 🛠️ Prérequis : Ce qu'il faut installer

Pour exécuter ce projet sur votre machine locale, vous aurez besoin des outils suivants installés et configurés :

1. **Java Development Kit (JDK) 17 ou supérieur** (pour le backend Spring Boot).
2. **Node.js (v20+) et npm** (pour le frontend Angular).
3. **Angular CLI (v18+)** (installation globale via `npm install -g @angular/cli`).
4. **Spring Boot** (pour la gestion des dépendances Java).
5. **MongoDB** (installé localement et en cours d'exécution sur le port par défaut `27017` ou un cluster MongoDB Atlas).

---

## 🚀 Comment lancer le projet étape par étape

### Étape 1 : Base de données
Assurez-vous que votre service **MongoDB fonctionne** (soit via MongoDB Compass, soit via les services Windows/Linux).
Le projet créera automatiquement la base de données `qualite_suivi_db` lors de son premier lancement.

### Étape 2 : Lancer le Backend (Spring Boot API)
1. Ouvrez un terminal et naviguez vers le dossier `backend` :
   ```bash
   cd backend
   ```
2. Installez les dépendances et lancez l'application :
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   *(Le backend démarrera sur le port **8080**. La base de données sera automatiquement peuplée avec des données de test tunisiennes via le `DataInitializer`.)*

### Étape 3 : Lancer le Frontend (Angular App)
1. Ouvrez un nouveau terminal et naviguez vers le dossier `frontend` :
   ```bash
   cd frontend
   ```
2. Installez les dépendances (si ce n'est pas déjà fait) :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement Angular :
   ```bash
   ng serve
   ```
4. Ouvrez votre navigateur et accédez à l'adresse : **`http://localhost:4200`**

---

## 🔐 Identifiants de Test (Générés Automatiquement)

Le script `DataInitializer` injecte automatiquement ces utilisateurs lors du premier démarrage :

* **Admin (Administrateur global) :**
  * Email : `admin@tunisie-qualite.tn`
  * Mot de passe : `admin123`
* **CHEF_PROJET (Chef de Projet Qualité) :**
  * Email : `amine.trabelsi@tunisie-qualite.tn`
  * Mot de passe : `chef123`
* **PILOTE_QUALITE (Pilote Qualité / Auditeur) :**
  * Email : `fatma.benali@tunisie-qualite.tn`
  * Mot de passe : `pilote123`

---

## ✨ Fonctionnalités actuelles (Ce qui est fait jusqu'à présent)

* **Architecture Sécurisée :**
  * Authentification JWT complète, gardiens de routes (AuthGuard & RoleGuard), intercepteurs de requêtes.
* **Gestion des Nomenclatures (Admin) :**
  * Opérations CRUD sécurisées pour gérer les Secteurs, Domaines, et Processus avec un design moderne.
* **Tableaux de bord dynamiques :**
  * Trois layouts distincts et cloisonnés (Admin, Chef de Projet, Pilote Qualité).
* **Gestion des Projets (UI Premium) :**
  * Liste des projets sous forme de **cartes Glassmorphism** modernes avec barres de progression animées.
  * Page de **détails du projet premium** complète avec timeline (chronologie) et modale de mise à jour intégrée.
* **Fiches de Suivi :**
  * Création dynamique de fiches de suivi directement liées aux projets.
  * Tableau interactif des fiches avec statuts colorés et boutons "Voir détails" pointant vers le bon contexte de projet.
* **Traitement de l'UI et de l'UX :**
  * Implémentation complète de **Tailwind CSS** et de composants **Angular Material**.
  * Interactions graphiques riches, badges de statut, formulaires réactifs avec validation.
* **Data Seeding & Migration :**
  * Algorithmes d'initialisation de base de données avancés générant des dizaines de projets avec un contexte métier réaliste.
* **Traçabilité :**
  * Auditing Entity (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`) fonctionnel sur toutes les entités principales de la BDD.

---

## 📈 Pourcentage de réalisation du projet : ** ~ 90 % **

**Pourquoi 90% ?**
La base technique, la sécurité, l'expérience utilisateur premium et tous les modules principaux (Projets, Fiches, Nomenclatures, Authentification, Routage) sont pleinement fonctionnels, stabilisés et fluides en mode production.

**Ce qu'il reste à finaliser (Les 10% restants) :**
- L'affichage complet et fonctionnel de la **page des Notifications** (les routes backend et frontend nécessitent un débogage des websockets/polling existants).
- La compilation finale des **KPIs / Rapports** pour le module "Pilote Qualité" (Dashboard analytique).
- Les **Exports de fichiers** (PDF/Excel) si requis dans le cahier des charges.
- La revue finale du code (Nettoyage des imports/types non utilisés) et le déploiement.
