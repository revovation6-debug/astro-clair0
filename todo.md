# Astro Clair - TODO

## Phase 1: Initialisation et Architecture de Base
- [x] Initialiser le projet avec features web-db-user
- [ ] Concevoir le schéma de base de données (users, agents, voyants, clients, avis, packs, etc.)
- [ ] Configurer l'authentification et les rôles (admin, agent, client)
- [ ] Créer les tables de base de données

## Phase 2: Interface Admin - Fonctionnalités Principales
- [ ] Créer la page de connexion admin
- [ ] Créer le tableau de bord admin principal
- [ ] Implémenter le menu utilisateur (hover sur le nom)
  - [ ] Gérer les logs des voyants
  - [ ] Statistiques agents
  - [ ] Générer des avis
  - [ ] Mon profil
  - [ ] Déconnexion

### Statistiques et Graphiques Admin
- [ ] Statistiques de visite du site (par jour, mois, année) avec graphiques
- [ ] Données analytiques en temps réel (par jour, mois, année)
- [ ] Nombre de clients inscrits en temps réel (par jour, mois, année)
- [ ] Chiffre et productivité de chaque agent en temps réel
- [ ] Agents connectés/en ligne en temps réel

### Gestion des Clients
- [ ] Voir la liste des clients inscrits
- [ ] Gérer les clients inscrits en temps réel
- [ ] Attribuer des packs de minutes gratuits aux clients fidèles
- [ ] Supprimer des comptes de clients

### Gestion des Agents et Voyants
- [ ] Créer, gérer et supprimer les comptes des agents (logs et mot de passe)
- [ ] Créer, gérer et supprimer les profils des voyants
- [ ] Attribuer des voyants à des agents spécifiques
- [ ] Voir les agents connectés/en ligne en temps réel

### Gestion des Avis
- [ ] Créer des avis pour la page d'accueil publique
- [ ] Attribuer des avis aux agents de voyance
- [ ] Valider les avis soumis par les clients avant affichage

## Phase 3: Interface Agents
- [ ] Créer la page de connexion agent
- [ ] Créer le tableau de bord agent avec conversations ordonnées par voyant
- [ ] Implémenter le système de tchat en temps réel avec les clients
- [ ] Afficher les profils voyants attribués à l'agent
- [ ] Voir les statistiques personnelles (chiffres, productivité globale et par client)
- [ ] Voir les statistiques de tchat par période (jour, mois, année)
- [ ] Créer le menu utilisateur avec les options (Mon profil, Statistiques, Déconnexion)
- [ ] Implémenter le filtre calendrier pour les statistiques

## Phase 4: Interface Clients/Visiteurs
- [x] Créer la page d'accueil publique inspirée de Kang.fr
- [x] Implémenter la section "Tous les experts" (agents en ligne/hors ligne)
- [x] Afficher la section "Les avis" sur la page d'accueil
- [x] Implémenter la section "Horoscope"
- [x] Créer le système de packs de minutes (5min-15€, 15min-45€, 30min-90€)
- [x] Implémenter le système de tchat avec minuteur en temps réel
- [x] Créer le tableau de bord client
- [x] Implémenter la gestion des minutes et décompte
- [x] Empêcher les conversations simultanées
- [x] Créer la section horoscope
- [ ] Créer la page de profil client avec ID de 7 chiffres
- [ ] Intégrer Stripe comme système de paiement
- [ ] Implémenter la détection d'IP pour éviter les inscriptions multiples
- [ ] Ajouter couleurs distinctes (rouge=gratuit, vert=payant) pour les minutes
- [ ] Mettre à jour les statistiques Agent avec distinction gratuit/payant
- [ ] Implémenter les mises à jour en temps réel
- [ ] Synchroniser le projet sur GitHub avec README détaillé

## Phase 5: Tests, Optimisations, GitHub et Livraison
- [ ] Tests fonctionnels complets
- [ ] Optimisations de performance
- [ ] Vérification de la sécurité (mots de passe, authentification, Stripe)
- [ ] Tests de responsive design
- [ ] Synchronisation GitHub avec README détaillé
- [ ] Déploiement et livraison finale
