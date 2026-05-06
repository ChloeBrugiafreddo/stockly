# Stockly — ERP de gestion de stock multi-domaines
![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/license-MIT-blue)
## Description
Stockly est un ERP de gestion et de traçabilité des stocks conçu pour
s'adapter à n'importe quel secteur d'activité. Chaque article enregistré
est entièrement traçable : origine, mouvements, historique, affectation —
vous savez à tout moment d'où vient un produit, où il est, et ce qu'il
lui est arrivé.
L'ERP est nativement spécialisé pour trois domaines (automobile, textile,
alimentaire), chacun disposant de champs métiers dédiés (ex : DLC et
allergènes pour l'alimentaire, immatriculation et pièces montées pour
l'automobile). Mais Stockly ne s'arrête pas là : chaque utilisateur peut
définir son propre domaine, créer ses catégories, ajouter ses champs
personnalisés, et configurer l'interface selon ses besoins réels —
sans toucher au code.
## Fonctionnalités principales
- Authentification sécurisée avec profil métier (NextAuth.js)
- Interface adaptative selon le domaine de l'utilisateur connecté
- Gestion CRUD complète des stocks (ajout, modification, suppression)
- Traçabilité complète : historique des mouvements, origine, affectation
- Gestion des clients (fiche, coordonnées, historique des commandes)
- Gestion des fournisseurs (fiche, conditions, articles liés)
- Gestion des factures (émission, suivi, export PDF)
- Dashboard avec statistiques en temps réel
- Export Excel et PDF
- Recherche globale (Ctrl+K)
- Module QR code / code-barres (v5.x — à venir)
## Stack technique
- **Frontend / Backend** : Next.js 14 (App Router)
- **Base de données** : MongoDB Atlas (non-relationnel)
- **Authentification** : NextAuth.js v5
- **Hébergement** : Vercel
- **Exports** : xlsx, jspdf, jspdf-autotable
## Domaines métiers supportés
| Domaine | Champs spécifiques |
|--------------|------------------------------------------------|
| Automobile | Immatriculation, pièces montées, technicien |
| Textile | Taille, couleur, matière, référence fournisseur|
| Alimentaire | DLC, allergènes, temp. conservation, lot |
| Personnalisé | Catégories libres définies par l'utilisateur |
## Installation (développement local)
```bash
git clone https://github.com/votre-org/stockly.git
cd stockly
npm install
cp .env.example .env.local
# Remplir les variables dans .env.local
npm run dev
```
## Variables d'environnement

```env
MONGODB_URI= # URI de connexion MongoDB Atlas
NEXTAUTH_SECRET= # Secret JWT (openssl rand -base64 32)
NEXTAUTH_URL= # http://localhost:3000 en local
```

## Architecture du projet
```
stockly/
■■■ app/ # Next.js App Router
■ ■■■ api/ # Routes API (remplace erp-api)
■ ■ ■■■ auth/ # NextAuth handlers
■ ■ ■■■ stocks/ # CRUD stocks
■ ■ ■■■ vehicles/ # Module automobile
■ ■ ■■■ dashboard/ # Stats
■ ■■■ (auth)/ # Pages login/register
■ ■■■ dashboard/ # App principale
■ ■■■ layout.tsx # Layout racine
■■■ lib/ # Utilitaires
■ ■■■ mongodb.ts # Connexion BDD
■ ■■■ auth.ts # Config NextAuth
■■■ models/ # Schémas Mongoose
■ ■■■ User.ts
■ ■■■ StockItem.ts # Schéma socle commun
■ ■■■ domains/ # Schémas par domaine
■■■ components/ # Composants React
```
## Sécurité & RGPD
- Mots de passe hashés avec bcrypt (salt rounds: 12)
- Sessions JWT signées (NextAuth)
- Variables sensibles en variables d'environnement
- Aucune donnée personnelle partagée avec des tiers
- Données hébergées sur MongoDB Atlas (région EU)
## Équipe
- [Chloé BRUGIAFREDDO] — Développeur full-stack / Frontend / Design
- [Rania CHADALI] — CyberSécurité / Architecture BDD / Hébergement
- [Louis COSSé] — CyberSécurité / Architecture BDD / Hébergement
