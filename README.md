# 🌟 Astro Clair - Plateforme de Tchat Voyance en Ligne

**Astro Clair** est une plateforme SaaS complète de consultation en ligne avec des voyants professionnels. Elle offre une expérience fluide et sécurisée pour les clients, les agents et les administrateurs.

## 📋 Table des Matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du Projet](#structure-du-projet)
- [API tRPC](#api-trpc)
- [Sécurité](#sécurité)
- [Déploiement](#déploiement)

---

## ✨ Fonctionnalités

### 🔐 Trois Espaces Distincts

#### **1. Espace Admin** (`/admin/dashboard`)
- 📊 **Tableau de bord** avec statistiques en temps réel
- 👥 **Gestion des agents** - Créer, modifier, supprimer les comptes agents
- 🔮 **Gestion des voyants** - Créer et assigner les profils voyants aux agents
- 👤 **Gestion des clients** - Voir, gérer et supprimer les comptes clients
- 💝 **Attribution de packs gratuits** - Offrir des minutes gratuites aux clients fidèles
- ⭐ **Gestion des avis** - Créer, valider et publier les avis
- 📈 **Statistiques détaillées** - Chiffres, productivité, revenus par période
- 📱 **Menu utilisateur** - Gestion des logs, statistiques, profil et déconnexion

#### **2. Espace Agent** (`/agent/dashboard`)
- 💬 **Gestion des conversations** - Tchat en temps réel avec les clients
- 📊 **Statistiques personnelles** - Chiffres, productivité, revenus par client
- 🎯 **Profils voyants assignés** - Voir les voyants attribués
- 📅 **Filtres calendrier** - Analyser les performances par période
- 🔴🟢 **Distinction minutes** - Voir les minutes gratuites (rouge) et payantes (vert)

#### **3. Espace Client/Visiteur** (`/`)
- 🌐 **Page d'accueil publique** - Inspirée de Kang.fr
- 👁️ **Section "Tous les experts"** - Affichage des voyants en ligne/hors ligne
- ⭐ **Section "Les avis"** - Avis des clients avec notes
- ♈ **Section "Horoscope"** - Horoscope quotidien des 12 signes
- 💳 **Packs de minutes** - 5min (15€), 15min (45€), 30min (90€)
- 💬 **Tchat en temps réel** - Minuteur avec décompte des minutes
- 👤 **Profil client** - ID unique de 7 chiffres, gestion des minutes
- 🛒 **Système de paiement Stripe** - Paiement sécurisé des packs

---

## 🏗️ Architecture

### Stack Technologique

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11 + Node.js
- **Database**: MySQL/TiDB avec Drizzle ORM
- **Authentification**: Manus OAuth
- **Paiement**: Stripe API
- **Temps réel**: WebSocket (via tRPC)

### Flux d'Authentification

```
Client → Manus OAuth → Session Cookie → tRPC Protected Procedures
```

### Structure des Données

```
Users (Admin, Agents, Clients)
├── Agents
│   └── Voyants (assignés à chaque agent)
├── Clients
│   ├── Minute Packs (gratuits/payants)
│   └── Conversations
│       └── Messages
└── Reviews (avis)
```

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- pnpm (ou npm/yarn)
- MySQL/TiDB database
- Clés Stripe (test ou production)

### Étapes

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/revovation6-debug/astro-clair0.git
   cd astro-clair0
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer les variables d'environnement** (voir section Configuration)

4. **Initialiser la base de données**
   ```bash
   pnpm db:push
   ```

5. **Démarrer le serveur de développement**
   ```bash
   pnpm dev
   ```

---

## ⚙️ Configuration

### Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/astro_clair

# OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
JWT_SECRET=your_jwt_secret

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Owner
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Your Name

# App
VITE_APP_TITLE=Astro Clair
VITE_APP_LOGO=https://...
```

### Configuration Stripe

1. Créez un compte Stripe: https://stripe.com
2. Récupérez vos clés API (test ou production)
3. Ajoutez-les aux variables d'environnement
4. Configurez les webhooks pour les paiements

---

## 📖 Utilisation

### Pour les Administrateurs

1. **Accédez au tableau de bord**: `/admin/dashboard`
2. **Créez des agents**: Allez à "Gestion des Agents"
3. **Créez des voyants**: Allez à "Gestion des Voyants" et assignez-les aux agents
4. **Gérez les clients**: Voir et attribuer des packs gratuits
5. **Créez des avis**: Allez à "Gestion des Avis"

### Pour les Agents

1. **Connectez-vous**: Utilisez vos identifiants d'agent
2. **Accédez au tableau de bord**: `/agent/dashboard`
3. **Gérez les conversations**: Répondez aux clients en temps réel
4. **Consultez vos statistiques**: Allez à "Statistiques"

### Pour les Clients

1. **Consultez la page d'accueil**: `/`
2. **Inscrivez-vous**: Créez un compte avec email, nom d'utilisateur et mot de passe
3. **Achetez des minutes**: Allez à `/client/checkout`
4. **Consultez un voyant**: Sélectionnez un voyant et démarrez une conversation
5. **Consultez votre profil**: Allez à `/client/profile`

---

## 📁 Structure du Projet

```
astro-clair/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ClientHome.tsx          # Page d'accueil publique
│   │   │   ├── AdminDashboard.tsx      # Tableau de bord admin
│   │   │   ├── AdminAgents.tsx         # Gestion des agents
│   │   │   ├── AdminClients.tsx        # Gestion des clients
│   │   │   ├── AdminReviews.tsx        # Gestion des avis
│   │   │   ├── AdminVoyants.tsx        # Gestion des voyants
│   │   │   ├── AgentDashboard.tsx      # Tableau de bord agent
│   │   │   ├── AgentStats.tsx          # Statistiques agent
│   │   │   ├── AgentProfile.tsx        # Profil agent
│   │   │   ├── ClientDashboard.tsx     # Tableau de bord client
│   │   │   ├── ClientProfile.tsx       # Profil client
│   │   │   └── ClientCheckout.tsx      # Paiement Stripe
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx     # Layout principal
│   │   │   └── ui/                     # Composants shadcn/ui
│   │   ├── App.tsx                     # Routeur principal
│   │   └── lib/trpc.ts                 # Client tRPC
│   └── public/
├── server/
│   ├── db.ts                           # Helpers de base de données
│   ├── routers.ts                      # Procédures tRPC
│   └── _core/
│       ├── env.ts                      # Variables d'environnement
│       ├── stripe.ts                   # Intégration Stripe
│       ├── ipDetection.ts              # Détection d'IP
│       ├── trpc.ts                     # Configuration tRPC
│       └── context.ts                  # Contexte tRPC
├── drizzle/
│   └── schema.ts                       # Schéma de base de données
├── shared/
│   └── const.ts                        # Constantes partagées
└── README.md                           # Ce fichier
```

---

## 🔌 API tRPC

### Procédures Admin

```typescript
// Tableau de bord
admin.getDashboardStats()

// Agents
admin.getAllAgents()
admin.createAgent({ username, passwordHash, userId })
admin.updateAgent({ id, updates })
admin.deleteAgent({ id })

// Voyants
admin.getAllVoyants()
admin.createVoyant({ agentId, name, specialty, description, imageUrl, pricePerMinute })
admin.deleteVoyant({ id })

// Clients
admin.getAllClients()
admin.deleteClient({ id })

// Packs
admin.grantMinutePack({ clientId, minutes, reason })

// Avis
admin.getAllReviews()
admin.createReview({ voyantId, rating, comment })
admin.approveReview({ id })
admin.rejectReview({ id })
```

### Procédures Agent

```typescript
// Profil
agent.getMyVoyants()

// Conversations
agent.getMyConversations()
agent.getConversationMessages({ conversationId })
agent.sendMessage({ conversationId, content })

// Statistiques
agent.getMyStats({ startDate, endDate })
```

### Procédures Client

```typescript
// Profil
clientData.getMyProfile()
clientData.getMyMinutes()

// Conversations
clientData.startConversation({ voyantId })
clientData.getActiveConversation()
clientData.sendClientMessage({ conversationId, content })
clientData.endConversation({ conversationId })

// Paiement
clientData.purchaseMinutePack({ packType })
```

### Procédures Publiques

```typescript
public.getPublishedReviews()
public.getAllVoyants()
public.getOnlineAgents()
```

---

## 🔒 Sécurité

### Authentification

- ✅ Manus OAuth pour l'authentification sécurisée
- ✅ Session cookies avec JWT
- ✅ Procédures protégées côté serveur

### Paiements

- ✅ Stripe pour les paiements sécurisés
- ✅ Clés API sécurisées (jamais exposées au client)
- ✅ Webhooks Stripe pour la validation

### Détection de Fraude

- ✅ Détection d'IP pour éviter les inscriptions multiples
- ✅ Logging des tentatives d'inscription
- ✅ Validation des données côté serveur

### Bonnes Pratiques

- ✅ HTTPS en production
- ✅ CORS configuré correctement
- ✅ Rate limiting recommandé
- ✅ Validation des entrées utilisateur

---

## 🚀 Déploiement

### Préparation

1. **Tester en production locale**
   ```bash
   NODE_ENV=production pnpm build
   NODE_ENV=production pnpm start
   ```

2. **Vérifier les variables d'environnement**
   - Utiliser les clés Stripe de production
   - Configurer la base de données de production
   - Mettre à jour les URLs

3. **Exécuter les migrations**
   ```bash
   pnpm db:push
   ```

### Plateformes Supportées

- **Vercel** (recommandé pour Next.js)
- **Railway** (simple et rapide)
- **Heroku** (avec buildpack Node.js)
- **AWS** (EC2 + RDS)
- **DigitalOcean** (App Platform)

### Checklist de Déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données en production
- [ ] Clés Stripe de production
- [ ] Webhooks Stripe configurés
- [ ] HTTPS activé
- [ ] Logs configurés
- [ ] Backups automatiques activés
- [ ] Monitoring en place

---

## 📊 Fonctionnalités Avancées

### Temps Réel

- 🔴 Minutes gratuites affichées en **rouge**
- 🟢 Minutes payantes affichées en **vert**
- ⏱️ Minuteur en temps réel pendant les conversations
- 📊 Statistiques mises à jour en temps réel

### Système de Minutes

- **Gratuit**: Offert par l'admin aux clients fidèles
- **Payant**: Acheté via Stripe
- **Expiration**: 30 jours après l'achat
- **Décompte**: Automatique pendant les conversations

### Gestion des Agents

- Assignation de voyants
- Statistiques de productivité
- Distinction gratuit/payant
- Historique des conversations

---

## 🐛 Dépannage

### Erreurs Courantes

**Erreur: "DATABASE_URL not found"**
- Vérifiez que la variable d'environnement est définie
- Vérifiez la connexion à la base de données

**Erreur: "STRIPE_SECRET_KEY not found"**
- Ajoutez vos clés Stripe aux variables d'environnement
- Utilisez les clés de test en développement

**Erreur: "OAuth callback failed"**
- Vérifiez votre APP_ID
- Vérifiez l'URL de callback dans Manus
- Assurez-vous que vous êtes connecté

---

## 📝 Licence

Ce projet est propriétaire. Tous droits réservés © 2024 Astro Clair.

---

## 👥 Support

Pour toute question ou problème, veuillez contacter l'équipe de support.

---

## 🎯 Roadmap

- [ ] Application mobile (React Native)
- [ ] Vidéo consultation (WebRTC)
- [ ] Système de recommandation IA
- [ ] Intégration calendrier
- [ ] Multi-langue
- [ ] Dark mode

---

**Dernière mise à jour**: Octobre 2024
