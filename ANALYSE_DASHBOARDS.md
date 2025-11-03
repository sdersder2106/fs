# Analyse Complète des Dashboards Admin & Client

## Vue d'ensemble

Cette application de pentest management dispose de deux niveaux d'accès principaux :
- **Dashboard Admin** : Accès complet avec fonctionnalités de gestion avancées
- **Dashboard Client/Pentester** : Accès aux fonctionnalités de base

---

## 📊 DASHBOARD PRINCIPAL (Tous les utilisateurs)

### Page : `/app/dashboard/page.tsx`

#### Fonctions React
1. **DashboardPage()** - Composant principal du dashboard
   - Affiche les statistiques de sécurité
   - Gère la sélection de période (7, 30, 90 jours)
   - Précharge les données pour améliorer les performances

2. **DashboardSkeleton()** - Composant de chargement
   - Affiche un squelette animé pendant le chargement des données

#### Fonctionnalités affichées
- **Statistiques rapides** (4 cartes) :
  - Findings critiques
  - Pentests actifs
  - Cibles à haut risque
  - Total des findings

- **Graphiques** :
  - Répartition par sévérité (VulnerabilitySeverityChart)
  - Tendance des findings (VulnerabilityBreakdownChart)

- **Activité récente** :
  - Liste des derniers findings
  - Statut de conformité

---

## 🔧 LAYOUT & NAVIGATION

### Page : `/app/dashboard/layout.tsx`

#### Fonctions React
1. **DashboardLayout()** - Layout principal avec sidebar et navigation
   - Gère l'état de la sidebar (ouvert/fermé)
   - Gère le menu utilisateur
   - Initialise la connexion WebSocket
   - Redirige les utilisateurs non authentifiés

#### Fonctionnalités de navigation
**Navigation standard (tous les utilisateurs)** :
- Dashboard (accueil)
- Pentests
- Targets (cibles)
- Findings (vulnérabilités)
- Reports (rapports)

**Navigation Admin uniquement** :
- Users (gestion des utilisateurs)
- Templates (modèles de rapports)
- Settings (paramètres système)

**Menu utilisateur** :
- Profile
- Company
- Settings
- Sign out

---

### Composant : `/components/layout/Sidebar.tsx`

#### Fonctions principales
1. **Sidebar()** - Composant de barre latérale
   - `toggleExpanded()` - Gère l'expansion des sous-menus
   - `isActive()` - Détermine si un lien est actif
   - `renderNavItem()` - Rendu d'un élément de navigation

2. **filteredNavItems** - Filtre les éléments selon le rôle
   - Vérifie `requiredRole` pour afficher ou masquer des éléments

#### Navigation complète
- Dashboard
- Pentests (badge: 3 actifs)
- Targets
- Findings (badge: 12)
- Reports
- **Templates** (ADMIN uniquement)
- Notifications (badge: 5)
- Settings
- **Company** (ADMIN uniquement)

---

## 🛡️ FONCTIONS SPÉCIFIQUES ADMIN

### API : `/app/api/templates/route.ts`

#### Fonctions principales

1. **GET()** - Liste tous les templates (ADMIN uniquement)
   - Filtres disponibles :
     - type
     - category
     - isPublic
     - query (recherche)
   - Pagination et tri
   - Calcule les statistiques d'utilisation

2. **POST()** - Créer un nouveau template (ADMIN uniquement)
   - Validation des données
   - Vérification des doublons
   - Extraction et validation des variables `{{variable}}`

3. **extractTemplateVariables()** - Utilitaire
   - Extrait toutes les variables d'un template
   - Format : `{{nom_variable}}`

4. **getTemplateUsageCount()** - Utilitaire
   - Calcule le nombre d'utilisations d'un template

#### Validation
- Vérifie que l'utilisateur est ADMIN via `requireAdmin()`
- Empêche l'accès aux utilisateurs non-admin (retourne 403)

---

## 👥 GESTION DES PENTESTS

### Page : `/app/dashboard/pentests/page.tsx`

#### Fonctions React
1. **PentestsPage()** - Liste des pentests
   - `fetchPentests()` - Récupère la liste des pentests
   - `handleDelete()` - Supprime un pentest

#### Fonctionnalités
- **Recherche** : Recherche par titre, description
- **Filtres** :
  - Statut (SCHEDULED, IN_PROGRESS, REPORTED, RESCAN, COMPLETED, CANCELLED)
- **Pagination** : Navigation entre les pages
- **Actions par pentest** :
  - Voir les détails (Eye)
  - Éditer (Edit)
  - Supprimer (Trash2)

#### Affichage des données
- Titre et description
- Cible associée
- Statut avec couleur
- Barre de progression
- Nombre de findings
- Dates de début/fin

### API : `/app/api/pentests/route.ts`

#### Fonctions principales

1. **GET()** - Liste les pentests
   - Filtres :
     - status
     - targetId
     - startDate / endDate
     - query (recherche)
   - Inclut les relations :
     - target (cible)
     - createdBy (créateur)
     - _count (statistiques)

2. **POST()** - Créer un pentest
   - **Validation** :
     - Vérifie que l'utilisateur est PENTESTER ou ADMIN
     - Vérifie que la cible existe
     - Détecte les chevauchements de dates sur la même cible
   - **Actions** :
     - Crée le pentest
     - Envoie des notifications aux utilisateurs de l'entreprise

#### Contrôle d'accès
- Accessible aux : ADMIN, PENTESTER
- Bloqué pour : CLIENT

---

## 🐛 GESTION DES FINDINGS (Vulnérabilités)

### Page : `/app/dashboard/findings/page.tsx`

#### Fonctions React
1. **FindingsPage()** - Liste des findings
   - `fetchFindings()` - Récupère les findings
   - `handleDelete()` - Supprime un finding
   - `handleStatusChange()` - Change le statut d'un finding

#### Fonctionnalités
- **Statistiques de sévérité** (5 cartes) :
  - CRITICAL (rouge)
  - HIGH (orange)
  - MEDIUM (jaune)
  - LOW (bleu)
  - INFO (gris)

- **Filtres** :
  - Recherche textuelle
  - Sévérité
  - Statut (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
  - Catégorie

- **Affichage expandable** :
  - Détails complets
  - Proof of Concept
  - Remediation
  - Assigné à / Reporté par

- **Actions** :
  - Changer le statut (dropdown)
  - Voir détails
  - Éditer
  - Supprimer

### API : `/app/api/findings/route.ts`

#### Fonctions principales

1. **GET()** - Liste les findings
   - Filtres multiples :
     - severity (CRITICAL, HIGH, MEDIUM, LOW, INFO)
     - status
     - pentestId
     - targetId
     - assignedToId
     - category
     - query
   - **Tri spécial** : Par sévérité (CRITICAL en premier)
   - Inclut toutes les relations (pentest, target, reporter, assignedTo)

2. **POST()** - Créer un finding
   - **Validations** :
     - Vérifie que l'utilisateur est PENTESTER ou ADMIN
     - Vérifie que le pentest existe et est actif
     - Vérifie que la cible correspond au pentest
     - Vérifie que l'assigné est valide
   - **Actions** :
     - Crée le finding
     - Met à jour le score de risque de la cible
     - Envoie des notifications :
       - À l'équipe du pentest
       - À la personne assignée

3. **updateTargetRiskScore()** - Utilitaire
   - Calcule le score de risque basé sur :
     - Sévérité des findings (pondération)
     - Score CVSS
   - Formule : `score = Σ(poids_sévérité × CVSS/10)`
   - Normalise le score entre 0-100

#### Contrôle d'accès
- **Création** : ADMIN, PENTESTER uniquement
- **Lecture** : Tous les utilisateurs authentifiés

---

## 📊 API DASHBOARD

### API : `/app/api/dashboard/route.ts`

#### Fonction principale

1. **GET()** - Récupère les données du dashboard
   - **Statistiques** :
     - `criticalFindings` - Findings critiques ouverts
     - `activePentests` - Pentests actifs
     - `highRiskTargets` - Cibles à haut risque
     - `totalFindings` - Total findings ouverts
     - `completedPentests` - Pentests complétés

   - **Données supplémentaires** :
     - `recentFindings` - 5 derniers findings
     - `severityBreakdown` - Répartition par sévérité
     - `complianceStatus` - Statut de conformité (92%)

   - **Optimisations** :
     - Utilise `Promise.all()` pour paralléliser les requêtes
     - Ne récupère que les counts (pas les données complètes)
     - Limite les findings récents à 5

#### Configuration
- `dynamic = 'force-dynamic'` - Pas de cache
- `revalidate = 0` - Toujours frais

---

## 🔐 AUTHENTIFICATION & AUTORISATIONS

### Fichier : `/lib/auth-helpers.ts`

#### Fonctions d'authentification

1. **getCurrentUser()** - Récupère l'utilisateur actuel
   - Retourne : id, email, name, role, companyId, companyName, image

2. **requireAuth()** - Requiert authentification
   - Lance une erreur si non authentifié

3. **requireRole(role)** - Requiert un rôle spécifique
   - Accepte string ou array de rôles

4. **requireAdmin()** - Requiert le rôle ADMIN
   - Utilisé pour protéger les routes admin

5. **requirePentester()** - Requiert ADMIN ou PENTESTER
   - Utilisé pour les routes de création de pentests/findings

#### Fonctions de vérification

6. **hasRole(role)** - Vérifie si l'utilisateur a un rôle

7. **isAdmin()** - Vérifie si admin

8. **isPentester()** - Vérifie si pentester

9. **canAccessCompany(companyId)** - Vérifie l'accès à une entreprise

#### Fonctions de gestion utilisateur

10. **createUser(data)** - Crée un nouvel utilisateur
    - Hash le mot de passe
    - Crée ou associe une entreprise
    - Crée une notification de bienvenue

11. **updatePassword(userId, currentPassword, newPassword)**
    - Vérifie l'ancien mot de passe
    - Hash et met à jour

12. **validateCredentials(email, password)** - Valide les credentials
    - Utilisé lors du login

13. **getUserById(userId)** - Récupère un utilisateur par ID

14. **updateUserProfile(userId, data)** - Met à jour le profil

---

## 🎨 COMPOSANTS UI

### StatCard (`/components/cards/StatCard.tsx`)

#### Fonctions principales
1. **StatCard()** - Carte de statistique
   - `getTrendIcon()` - Retourne l'icône de tendance (↑↓−)
   - `getTrendColor()` - Retourne la couleur selon la tendance

#### Props
- title, value, description
- icon (composant React)
- trend { value, label }
- variant (default, success, warning, danger, info)

---

## 🔄 HOOKS PERSONNALISÉS

### Fichier : `/hooks/useSimpleCache.ts`

#### Hooks de données avec cache

1. **useFetch(url, options)** - Hook générique de fetch
   - Cache automatique (60 secondes)
   - Gestion loading et erreurs

2. **useDashboard(period)** - Données du dashboard
   - Période : 7, 30, ou 90 jours

3. **usePentests(page, limit)** - Liste des pentests
   - Pagination intégrée

4. **useFindings(filters, page, limit)** - Liste des findings
   - Filtres configurables

5. **useTargets(page, limit)** - Liste des cibles

#### Hooks de mutation

6. **useMutation(url, method)** - Hook générique de mutation
   - `mutate(data)` - Envoie les données
   - Clear le cache après succès

7. **useCreatePentest()** - Créer un pentest

8. **useCreateFinding()** - Créer un finding

9. **useCreateTarget()** - Créer une cible

#### Hooks de préchargement

10. **usePrefetch()** - Précharge les données
    - `prefetchDashboard()`
    - `prefetchPentests()`
    - `prefetchFindings()`
    - `prefetchTargets()`

---

## 🎯 RÉSUMÉ DES FONCTIONS PAR RÔLE

### 🔴 ADMIN UNIQUEMENT
1. **Gestion des templates**
   - Créer des templates de rapports
   - Éditer des templates
   - Voir les statistiques d'utilisation
   - Gérer la visibilité (public/privé)

2. **Gestion des utilisateurs** (route mentionnée mais non implémentée)
   - `/dashboard/users` (référencée dans layout)

3. **Accès complet aux settings**
   - Paramètres système
   - Configuration de l'entreprise

### 🟡 PENTESTER (+ ADMIN)
1. **Créer des pentests**
   - Définir cibles, dates, méthodologie
   - Suivre la progression

2. **Créer des findings**
   - Rapporter des vulnérabilités
   - Assigner des findings
   - Joindre des preuves

3. **Éditer pentests et findings**

### 🟢 CLIENT (+ PENTESTER + ADMIN)
1. **Consulter le dashboard**
   - Voir les statistiques
   - Consulter les graphiques
   - Voir l'activité récente

2. **Consulter les pentests**
   - Liste complète
   - Détails des pentests
   - Progression

3. **Consulter les findings**
   - Liste avec filtres
   - Détails des vulnérabilités
   - Changer le statut

4. **Consulter les targets**
   - Liste des cibles
   - Scores de risque

5. **Consulter les reports**
   - Rapports générés

6. **Gérer son profil**
   - Modifier ses informations
   - Changer son mot de passe

---

## 📋 ROUTES API COMPLÈTES

### Routes authentifiées (tous utilisateurs)
```
GET  /api/dashboard              - Statistiques dashboard
GET  /api/pentests               - Liste pentests
GET  /api/pentests/[id]          - Détail pentest
GET  /api/findings               - Liste findings
GET  /api/findings/[id]          - Détail finding
GET  /api/targets                - Liste targets
GET  /api/targets/[id]           - Détail target
GET  /api/reports                - Liste rapports
GET  /api/notifications          - Notifications
```

### Routes PENTESTER + ADMIN
```
POST   /api/pentests             - Créer pentest
PUT    /api/pentests/[id]        - Modifier pentest
DELETE /api/pentests/[id]        - Supprimer pentest
POST   /api/findings             - Créer finding
PUT    /api/findings/[id]        - Modifier finding
DELETE /api/findings/[id]        - Supprimer finding (si OPEN uniquement)
POST   /api/targets              - Créer target
POST   /api/reports/generate     - Générer rapport
```

### Routes ADMIN uniquement
```
GET    /api/templates            - Liste templates
POST   /api/templates            - Créer template
GET    /api/templates/[id]       - Détail template
PUT    /api/templates/[id]       - Modifier template
DELETE /api/templates/[id]       - Supprimer template
```

---

## 🔍 FONCTIONNALITÉS AVANCÉES

### 1. Système de cache
- Cache en mémoire (Map)
- Durée : 60 secondes
- Invalidation automatique après mutations

### 2. WebSocket
- Connexion automatique dans le layout
- Notifications en temps réel
- Indicateur de connexion

### 3. Notifications
- Templates prédéfinis
- Notifications d'équipe
- Notifications individuelles
- Types : pentest créé, finding créé, finding assigné

### 4. Calcul de risque automatique
- Score basé sur les findings
- Pondération par sévérité
- Mise à jour en temps réel

### 5. Validation avancée
- Schémas Zod pour toutes les entrées
- Validation des templates (variables)
- Vérification des chevauchements de pentests
- Contrôle d'accès multi-niveaux

### 6. Optimisations de performance
- Préchargement des données (prefetch)
- Queries parallèles (Promise.all)
- Pagination sur toutes les listes
- Counts au lieu de données complètes quand possible

---

## 📁 STRUCTURE DES FICHIERS

```
app/
├── dashboard/
│   ├── page.tsx                    - Dashboard principal
│   ├── layout.tsx                  - Layout avec navigation
│   ├── pentests/
│   │   ├── page.tsx                - Liste pentests
│   │   ├── new/page.tsx            - Créer pentest
│   │   └── [id]/
│   │       ├── page.tsx            - Détails pentest
│   │       └── edit/page.tsx       - Éditer pentest
│   ├── findings/
│   │   ├── page.tsx                - Liste findings
│   │   ├── new/page.tsx            - Créer finding
│   │   └── [id]/page.tsx           - Détails finding
│   ├── targets/
│   └── reports/
├── api/
│   ├── dashboard/route.ts          - API dashboard
│   ├── pentests/route.ts           - API pentests
│   ├── findings/route.ts           - API findings
│   └── templates/route.ts          - API templates (ADMIN)
│
components/
├── layout/
│   ├── Sidebar.tsx                 - Navigation latérale
│   └── Header.tsx
├── cards/
│   ├── StatCard.tsx                - Cartes statistiques
│   └── ComplianceCard.tsx
└── charts/
    ├── VulnerabilitySeverityChart.tsx
    └── VulnerabilityBreakdownChart.tsx

lib/
├── auth-helpers.ts                 - 14 fonctions d'auth
├── api-response.ts                 - Helpers de réponse
├── validations.ts                  - Schémas Zod
└── notifications.ts                - Système de notifications

hooks/
└── useSimpleCache.ts               - 10 hooks personnalisés
```

---

## 🎯 TOTAL DES FONCTIONS

### Composants React : ~15 fonctions
- DashboardPage, DashboardSkeleton
- DashboardLayout
- Sidebar (renderNavItem, toggleExpanded, isActive)
- StatCard (getTrendIcon, getTrendColor)
- PentestsPage (fetchPentests, handleDelete)
- FindingsPage (fetchFindings, handleDelete, handleStatusChange)

### API Routes : ~10 fonctions principales
- GET/POST dashboard
- GET/POST pentests
- GET/POST findings
- GET/POST templates (ADMIN)
- Helpers (updateTargetRiskScore, extractTemplateVariables, getTemplateUsageCount)

### Auth & Helpers : ~14 fonctions
- getCurrentUser, requireAuth, requireRole, requireAdmin, requirePentester
- hasRole, isAdmin, isPentester, canAccessCompany
- createUser, updatePassword, validateCredentials
- getUserById, updateUserProfile

### Hooks : ~10 hooks
- useFetch, useDashboard, usePentests, useFindings, useTargets
- useMutation, useCreatePentest, useCreateFinding, useCreateTarget
- usePrefetch

### **TOTAL : ~50+ fonctions principales**

---

## 🔐 MATRICE DE PERMISSIONS

| Fonctionnalité | CLIENT | PENTESTER | ADMIN |
|---------------|--------|-----------|-------|
| Voir dashboard | ✅ | ✅ | ✅ |
| Voir pentests | ✅ | ✅ | ✅ |
| Créer pentest | ❌ | ✅ | ✅ |
| Voir findings | ✅ | ✅ | ✅ |
| Créer finding | ❌ | ✅ | ✅ |
| Changer statut finding | ✅ | ✅ | ✅ |
| Supprimer finding | ❌ | ✅ (si OPEN) | ✅ |
| Voir templates | ❌ | ❌ | ✅ |
| Créer template | ❌ | ❌ | ✅ |
| Gérer users | ❌ | ❌ | ✅ |
| Settings système | ❌ | ❌ | ✅ |

---

## 📌 NOTES IMPORTANTES

1. **Multi-tenant** : Toutes les données sont isolées par `companyId`
2. **Validation** : Tous les inputs sont validés avec Zod
3. **Sécurité** : Vérification des permissions à chaque API call
4. **Performance** : Cache, prefetch, et queries optimisées
5. **Real-time** : WebSocket pour notifications instantanées
6. **Audit** : Tracking automatique des créateurs (createdBy)

---

**Date d'analyse** : 2025-11-03
**Version** : Base44 Pentest Management Platform
