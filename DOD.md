# Definition of Done — Stockly ERP
Une User Story / fonctionnalité est TERMINÉE si :
## ■ Critères techniques
- [ ] Le code compile sans erreur (next build passe)
- [ ] Aucune erreur TypeScript (ou ESLint bloquante)
- [ ] Les fonctions complexes sont commentées (JSDoc)
- [ ] Aucune clé API ou credential en dur dans le code
- [ ] Variables sensibles dans .env.local uniquement
## ■ Critères fonctionnels
- [ ] La feature répond au besoin décrit dans le sprint
- [ ] Testée manuellement sur au moins 2 cas d'usage réels
- [ ] Les cas d'erreur sont gérés (affichage d'un message clair)
- [ ] Validée par un autre membre de l'équipe (peer review)
- [ ] Fonctionne sur Chrome ET Firefox
## ■ Critères de sécurité
- [ ] Les routes API vérifient l'authentification (getServerSession)
- [ ] Les mots de passe sont hashés (bcrypt, min 12 rounds)
- [ ] Les entrées utilisateur sont validées côté serveur (Zod)
- [ ] Pas d'injection MongoDB possible (pas de $where dynamique)
- [ ] L'utilisateur ne peut accéder qu'à SES propres données
## ■ Critères de documentation
- [ ] Le CHANGELOG.md est mis à jour avec la nouvelle version
- [ ] Le README.md est mis à jour si l'architecture a changé
- [ ] Les nouvelles variables d'env sont dans .env.example
## ■ Critères de livraison
- [ ] Code mergé sur la branche 'main' via Pull Request
- [ ] Tag Git créé (ex: v2.1.0)
- [ ] Build Vercel en succès (pas d'erreur de déploiement)
- [ ] Release GitHub publiée si version majeure/mineure