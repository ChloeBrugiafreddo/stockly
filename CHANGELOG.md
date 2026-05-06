# CHANGELOG — Stockly ERP

Format : [Keep a Changelog](https://keepachangelog.com)
Versioning : [Semantic Versioning](https://semver.org)

---
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