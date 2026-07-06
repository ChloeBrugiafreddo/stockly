# CHANGELOG — Stockly ERP

Format : [Keep a Changelog](https://keepachangelog.com)
Versioning : [Semantic Versioning](https://semver.org)

---

## [Unreleased]
### Planned
- Module QR code / code-barres (v5.x)
- Notifications alertes stock bas
- Dashboard avec vraies statistiques
- Page Véhicules (module automobile)
- Page Factures

## [1.9.0] - 2025-05-11
### Added
- Badge domaine coloré dans la sidebar (Automobile, Textile, Alimentaire)
- Bouton de déconnexion avec nom et email utilisateur dans la sidebar
- Placeholders contextuels dans le formulaire stock selon le domaine
- Système d'alertes intelligentes par domaine (stock, factures, productions)
- Panneau d'alertes sur le dashboard avec navigation directe
- Badge rouge sur Dashboard si alertes actives
- Route API GET /api/alerts
### Changed
- SessionProvider ajouté au layout global
- Domaine métier inclus dans le token JWT et la session


## [1.8.0] - 2025-05-11
### Added
- Page Factures complète avec CRUD, filtres et stats rapides
- Création de facture avec sélecteur de client existant
- Liaison facture ↔ production avec import automatique des composants
- Calcul automatique HT / TVA / TTC
- Export PDF de chaque facture
- Changement de statut : DRAFT → SENT → PAID / CANCELLED
- Route API GET/POST /api/invoices
- Route API PUT/DELETE /api/invoices/[id]
- Route API GET /api/productions/[id]/invoice-data
- Historique client : modale avec toutes ses factures et stats
- Route API GET /api/customers/[id]/history
- EntityPage : lignes cliquables avec onRowClick
### Changed
- Invoice model : ajout customerId et productionId

## [1.7.0] - 2025-05-11
### Added
- Module Productions/Assemblages complet
- Création de productions avec référence, nom, description et statut
- Ajout de composants depuis le stock avec décrément automatique
- Retrait de composants avec remise en stock automatique
- Historique des mouvements lié à la production (traçabilité complète)
- Changement de statut : EN_COURS → TERMINE → ARCHIVE
- Route API GET/POST /api/productions
- Route API PUT/DELETE /api/productions/[id]
- Route API POST /api/productions/[id]/components
- Route API DELETE /api/productions/[id]/components/[componentId]
### Fixed
- Dashboard : mouvements et stats filtrés par companyId (isolation des données)
- StockMovement : ajout de 'production' dans les valeurs de referenceType

## [1.6.0] - 2025-05-11
### Added
- Dashboard avec vraies statistiques (produits, ruptures, stock bas, clients, fournisseurs)
- Alertes visuelles ruptures et stock bas
- Liste des 10 derniers mouvements de stock avec produit et motif
- Route API GET /api/dashboard/stats

## [1.5.0] - 2025-05-11
### Added
- Page Clients avec CRUD complet (ajout, modification, suppression, recherche)
- Page Fournisseurs avec CRUD complet
- Routes API GET/POST /api/customers et /api/suppliers
- Routes API PUT/DELETE /api/customers/[id] et /api/suppliers/[id]
- Composant réutilisable EntityPage pour les pages de liste génériques

## [1.4.0] - 2025-05-11
### Added
- Page Stock complète avec tableau et filtres (catégorie, état, recherche)
- CRUD produits : ajout, modification, suppression
- Mouvements de stock entrée/sortie avec motif
- Historique des mouvements par produit
- Routes API GET/POST /api/stocks, PUT/DELETE /api/stocks/[id]
- Routes API GET/POST /api/stocks/[id]/movements
- Route API GET /api/categories
- Formulaires login et register redesignés avec logo Stockly
- lib/models.ts pour enregistrement centralisé des modèles Mongoose

## [1.3.0] - 2025-05-11
### Added
- Layout principal responsive mobile/tablette/desktop (mobile first)
- Sidebar avec navigation et liens actifs
- Topbar avec logo Stockly adaptatif selon le thème
- Bottom navigation mobile
- Switch dark/light mode avec next-themes
- Logo dynamique selon le thème (fondclair/fondsombre)
- Page dashboard de base avec cards statistiques

## [1.2.0] - 2025-05-11
### Added
- Authentification complète : login, register, sessions JWT (NextAuth)
- Inscription avec création automatique entreprise et rôle Admin
- Seed des 3 secteurs (Automobile, Textile, Alimentaire) et leurs catégories
- Pages /login, /register et /dashboard de base
- Route API GET /api/sectors
- Route API GET /api/seed

## [1.1.0] - 2025-05-11
### Added
- Modèles Mongoose complets : Company, Sector, Role, User
- Modèles entrepôts : Warehouse, WarehouseLocation
- Modèles produits : Category, Product, Stock, StockMovement
- Modèles commercial : Supplier, Customer, Order, Invoice
- Modèles personnalisation : CustomField, CustomFieldValue
- Index MongoDB sur SKU, Stock et CustomFieldValue

## [1.0.0] - 2025-05-11
### Added
- Initialisation du projet Stockly Next.js 14
- Configuration MongoDB Atlas + MongoDB local (dev)
- Configuration NextAuth.js v5
- Structure de base du projet (App Router, lib, models, components)
- README.md, DOD.md et .env.example