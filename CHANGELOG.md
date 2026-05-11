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