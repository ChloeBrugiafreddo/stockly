# CHANGELOG — Stockly ERP

Format : [Keep a Changelog](https://keepachangelog.com)
Versioning : [Semantic Versioning](https://semver.org)

---
## [1.3.0] - 2025-05-06
### Added
- Layout principal responsive mobile/tablette/desktop
- Sidebar avec navigation et liens actifs
- Topbar avec logo Stockly, recherche, notifications, avatar
- Bottom navigation mobile
- Dark/light mode switch avec next-themes
- Logo dynamique selon le thème
- Page dashboard de base avec stats cards

## [1.2.0] - 2025-05-06
### Added
- Seed des secteurs (Automobile, Textile, Alimentaire) avec modules
- Seed des catégories simplifiées et lisibles par secteur
- Route API /api/seed pour initialiser la base
- Route API /api/sectors pour récupérer les secteurs disponibles
- Handler NextAuth + route API register
- Pages login et register avec formulaire complet
- Layout protégé pour les routes authentifiées
- Page dashboard de base

### Changed
- Catégories Textile reformulées pour plus de clarté
- Catégories Alimentaire reformulées pour plus de clarté

## [1.1.0] - 2025-05-06
### Added
- Modèles Mongoose complets : Company, Sector, Role, User
- Modèles entrepôts : Warehouse, WarehouseLocation
- Modèles produits : Category, Product, Stock, StockMovement
- Modèles commercial : Supplier, Customer, Order, Invoice
- Modèles personnalisation : CustomField, CustomFieldValue
- Index MongoDB sur SKU (unique par company),Stock (unique par produit/entrepôt/emplacement), CustomFieldValue

## [Unreleased]
### Planned
- Module QR code / code-barres (v5.x)
- Notifications alertes stock bas

## [1.0.0] - 2025-05-06
### Added
- Initialisation du projet Stockly Next.js 14
- Configuration MongoDB Atlas
- Configuration NextAuth.js v5
- Structure de base du projet (app router, lib, models, components)