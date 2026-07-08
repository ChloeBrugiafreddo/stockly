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

## [1.22.0] - 2026-07-08
### Added
- Page Fournisseurs redesignée : cartes groupées par pays
- Email et téléphone cliquables (mailto: et tel:)
- Champ Notes dans le formulaire fournisseur
- Menu déroulant fournisseur dans le formulaire stock
- Colonne fournisseur dans le tableau stock
- Tableau stock groupé par catégorie avec stats (total unités, valeur HT)
- Header catégorie cliquable pour réduire/agrandir
- Boutons d'action visibles au hover uniquement
- Alertes visuelles sur les catégories avec ruptures/stock bas
### Fixed
- Ordre des colonnes stock corrigé (Fournisseur après Produit)
- populate supplierId dans GET /api/stocks

## [1.21.0] - 2026-07-08
### Added
- Module scanner code-barres et QR code (/scan)
- Scan via caméra avec viseur animé et ligne de scan (BrowserMultiFormatReader)
- Saisie manuelle du code en fallback si pas de caméra
- Reconnaissance produit existant par SKU dans la BDD
- Création automatique nouveau produit si code inconnu
- Formulaire réception : quantité, fournisseur, notes pré-remplis
- Mouvement stock IN créé automatiquement à la validation
- Écran confirmation animé avec résumé de la réception
- Route API GET /api/scan/lookup — recherche produit par code
- Route API POST /api/scan/receive — enregistrement réception
- Lien Scanner dans la sidebar (tous les rôles)
- /scan ajouté dans les permissions de tous les rôles
### Note
- Test caméra mobile nécessite HTTPS — sera validé après déploiement Vercel

## [1.20.0] - 2026-07-06
### Added
- Export Excel mis en forme avec xlsx-js-style (headers colorés, alternance lignes, bordures)
- Export Excel dans page Stock (bleu)
- Export Excel dans page Devis (violet)
- Export Excel rapport complet KPI 3 onglets (Stock + Devis + Productions)
- Export PDF dans page Stock
- Export PDF dans page Devis
- Recherche globale fonctionnelle avec ⌘K (produits, clients, fournisseurs, productions, devis)
- Navigation clavier dans les résultats (↑↓ + Entrée)
- Protection des routes par rôle côté serveur dans app/(app)/layout.tsx
- Middleware passant x-pathname sans bloquer /api/auth/
### Fixed
- Double + dans les boutons "Nouvelle production" et "Ajouter produit"

## [1.19.0] - 2026-07-06
### Added
- Super Admin Stockly : panneau d'administration global
- Login Super Admin sécurisé (cookie httpOnly, credentials en .env)
- Stats globales : entreprises, users, produits, devis, productions, mouvements
- Tableau détaillé de toutes les entreprises avec métriques
- Gestion des secteurs : créer, modifier, supprimer
- Formulaire création secteur : couleurs, vocabulaire, icônes, catégories
- Aperçu live du thème lors de la création/modification
- Suppression entreprise avec toutes ses données
- Routes API /api/superadmin/auth, /api/superadmin/check
- Routes API /api/superadmin/stats, /api/superadmin/sectors, /api/superadmin/companies/[id]
### Changed
- Modèle Sector enrichi avec theme, vocab, icons, defaultCategories

## [1.18.0] - 2026-07-06
### Added
- Thèmes dynamiques par domaine stockés en BDD (collection sectors)
- CSS variables appliquées automatiquement à la connexion
- Vocabulaire adapté : Pièces/Véhicules, Matières/Collections, Équipements/Recettes
- Icônes contextuelles par secteur
- DomainThemeProvider et hook useDomainTheme
- Route API GET /api/theme
### Changed
- Modèle Sector enrichi : theme, vocab, icons, defaultCategories
- lib/seed.ts : thèmes complets insérés pour les 3 secteurs
- Sidebar : couleurs dynamiques via CSS vars
- Pages Stock et Productions : titres et vocabulaire adaptés au domaine

## [1.17.0] - 2026-07-06
### Added
- Landing page professionnelle avec dark/light mode
- Animations fade-in au scroll (IntersectionObserver)
- Sections : hero, secteurs, features, stats, CTA
- Lien "Retour à l'accueil" sur les pages login et register
- Redirection vers /dashboard si déjà connecté
### Changed
- app/page.tsx remplacé par la landing page (plus de redirect direct)

## [1.16.0] - 2026-07-06
### Added
- Multi-utilisateurs avec rôles : Admin, Manager, Employé
- Admin peut créer des comptes collaborateurs depuis Paramètres → Utilisateurs
- Sidebar filtrée selon le rôle connecté
- Badge rôle coloré dans le UserMenu
- roleName inclus dans le JWT token et la session
- Routes API GET/POST /api/settings/users
- Routes API PUT/DELETE /api/settings/users/[id]
- Composant UsersSettings avec liste des membres et changement de rôle
### Changed
- lib/auth.ts : roleName et domain ajoutés dans le token JWT
- Sidebar : navItems filtrés par rôle, Paramètres visible Admin uniquement
- UserMenu : affiche le rôle de l'utilisateur connecté

## [1.15.0] - 2026-07-06
### Added
- Onglets Dashboard : Vue d'ensemble + KPI & Rapports
- KPI : valeur stock HT, CA année, mouvements 30j, productions, coût
- Tableau stock critique et derniers devis dans l'onglet KPI
- Export rapport complet PDF (stock + devis + productions)
- Routes API /api/reports/stock, /api/reports/quotes, /api/reports/productions, /api/reports/movements
### Changed
- Page dashboard restructurée avec DashboardTabs

## [1.14.0] - 2025-05-11
### Added
- Rapport de réapprovisionnement : modale avec liste des produits BAS/RUPTURE
- Quantités modifiables avant export
- Export PDF groupé par fournisseur avec coordonnées
- Route API GET /api/stocks/reorder-report
### Removed
- Page commandes fournisseurs (remplacée par le rapport PDF)
- Bouton panier dans le tableau stock

## [1.13.0] - 2025-05-11
### Added
- Wizard onboarding 4 étapes pour les nouveaux utilisateurs
- Barre de progression et navigation entre étapes
- Détection automatique des étapes déjà complétées
- Bouton "Passer" et "Commencer" une fois tout fait
- Cloche de notifications cliquable avec panel dropdown
- Alertes actives dans le panel avec navigation directe
- Bouton "Revoir le guide de démarrage" dans le panel
- Route API GET/POST /api/onboarding
- Route API POST /api/onboarding/reset

## [1.12.0] - 2025-05-11
### Added
- Carte d'identité des productions avec 4 onglets
- Vue d'ensemble : coût composants, CA HT, marge brute HT
- Composants : tableau détaillé avec prix unitaire et total par pièce
- Devis liés : liste avec statuts et totaux
- Mouvements : historique des entrées/sorties liées à la production
- Route API GET /api/productions/[id]/identity
### Changed
- Renommage Factures → Devis dans toute l'interface
- Suppression taxAmount du modèle Invoice — TVA calculée à l'affichage
- Calculs cohérents HT/TVA/TTC partout (TVA = 20% systématique)
- Marge calculée HT vs HT (CA devis HT - coût)

## [1.11.0] - 2025-05-11
### Added
- Carte d'identité produit : vue complète avec 4 onglets
- Onglet Vue d'ensemble : stats, infos produit, fournisseur
- Onglet Mouvements : historique complet avec motifs
- Onglet Productions : toutes les productions ayant utilisé ce produit
- Onglet Champs custom : valeurs personnalisées du produit
- Route API GET /api/stocks/[id]/identity
- Bouton violet "carte d'identité" dans le tableau stock

## [1.10.0] - 2025-05-11
### Added
- Page Paramètres complète avec 3 onglets
- Onglet Profil : modifier nom, email, mot de passe
- Onglet Entreprise : modifier infos + affichage du secteur
- Onglet Champs personnalisés : créer/supprimer des champs par domaine
- Champs custom affichés dynamiquement dans le formulaire stock
- Sauvegarde des valeurs custom par produit
- Routes API settings/profile, settings/company, settings/custom-fields
- Route API stocks/[id]/custom-values
### Changed
- Placeholders des champs custom adaptés au domaine connecté

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