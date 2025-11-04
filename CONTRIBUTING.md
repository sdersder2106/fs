# 🤝 GUIDE DE CONTRIBUTION BASE44

## Contribuer à BASE44

Merci de votre intérêt pour contribuer à BASE44 ! Ce guide vous aidera à contribuer efficacement au projet.

---

## 📋 Table des Matières

1. [Code de Conduite](#code-de-conduite)
2. [Comment Contribuer](#comment-contribuer)
3. [Setup Développement](#setup-développement)
4. [Standards de Code](#standards-de-code)
5. [Git Workflow](#git-workflow)
6. [Pull Requests](#pull-requests)
7. [Reporting Bugs](#reporting-bugs)
8. [Feature Requests](#feature-requests)
9. [Code Review](#code-review)
10. [Release Process](#release-process)

---

## 📜 Code de Conduite

### Notre Engagement

Nous nous engageons à faire de la participation à ce projet une expérience exempte de harcèlement pour tous.

### Standards

**Comportements encouragés :**
- ✅ Utiliser un langage accueillant et inclusif
- ✅ Respecter les points de vue différents
- ✅ Accepter gracieusement les critiques constructives
- ✅ Se concentrer sur ce qui est meilleur pour la communauté
- ✅ Montrer de l'empathie envers les autres

**Comportements inacceptables :**
- ❌ Langage ou images sexualisés
- ❌ Trolling, commentaires insultants
- ❌ Harcèlement public ou privé
- ❌ Publication d'informations privées sans permission
- ❌ Toute conduite inappropriée en contexte professionnel

---

## 🚀 Comment Contribuer

### Types de Contributions

**1. Bug Fixes**
- Corriger des bugs existants
- Améliorer la gestion d'erreurs
- Résoudre des problèmes de performance

**2. Features**
- Nouvelles fonctionnalités
- Améliorations UI/UX
- Intégrations tierces

**3. Documentation**
- Améliorer guides existants
- Ajouter tutoriels
- Corriger typos

**4. Tests**
- Ajouter tests unitaires
- Tests d'intégration
- Tests E2E

**5. Refactoring**
- Améliorer la qualité du code
- Optimiser les performances
- Réduire la dette technique

---

## 💻 Setup Développement

### Prérequis

- Node.js 18+ et npm 9+
- PostgreSQL 16+
- Git
- Compte GitHub

### Installation

**1. Fork le Repository**

```bash
# Fork sur GitHub puis clone
git clone https://github.com/YOUR_USERNAME/base44.git
cd base44
```

**2. Installer les Dépendances**

```bash
npm install
```

**3. Configuration Environnement**

```bash
# Copier .env.example
cp .env.example .env

# Éditer .env avec vos credentials
# - DATABASE_URL (PostgreSQL)
# - NEXTAUTH_SECRET (générer avec: openssl rand -base64 32)
# - PUSHER credentials (dashboard.pusher.com)
```

**4. Setup Base de Données**

```bash
# Générer Prisma Client
npx prisma generate

# Créer la base de données
npx prisma db push

# Seed données de test
npm run prisma:seed
```

**5. Lancer le Serveur de Dev**

```bash
npm run dev
```

**6. Ouvrir l'Application**

```
http://localhost:3000
```

### Structure de Branche

```
main
├── develop
│   ├── feature/nouvelle-feature
│   ├── fix/bug-fix
│   └── docs/documentation
└── release/v1.0.0
```

**Branches :**
- `main` : Production-ready code
- `develop` : Intégration des features
- `feature/*` : Nouvelles fonctionnalités
- `fix/*` : Bug fixes
- `docs/*` : Documentation
- `refactor/*` : Refactoring
- `test/*` : Tests

---

## 📏 Standards de Code

### TypeScript

**✅ FAIRE :**

```typescript
// Type explicite pour les props
interface UserCardProps {
  user: User;
  onClick?: () => void;
}

// Fonction avec type de retour
function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

// Utiliser const assertions
const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
type Severity = typeof SEVERITIES[number];
```

**❌ NE PAS FAIRE :**

```typescript
// Éviter 'any'
function process(data: any) { } // ❌

// Préférer type explicite
function process(data: unknown) { } // ✅

// Éviter les assertions dangereuses
const value = data as string; // ❌

// Utiliser type guards
if (typeof data === 'string') { } // ✅
```

### React Components

**Structure recommandée :**

```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Types en premier
interface Props {
  title: string;
  onSave?: (data: FormData) => void;
}

// Component
export function MyComponent({ title, onSave }: Props) {
  // 1. Hooks au top
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 2. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 3. Event handlers
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave?.(formData);
    } finally {
      setLoading(false);
    }
  };
  
  // 4. Early returns
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // 5. Main render
  return (
    <form onSubmit={handleSubmit}>
      <h1>{title}</h1>
      {/* ... */}
    </form>
  );
}
```

### Naming Conventions

**Files :**
```
components/TargetCard.tsx          // Components
hooks/use-pagination.ts            // Hooks
lib/format-date.ts                 // Utils
app/api/targets/route.ts           // API routes
```

**Variables & Functions :**
```typescript
// Components, Types, Interfaces
const TargetCard = () => { };
type User = { };
interface UserProps { }

// Functions, variables
const formatDate = () => { };
const userName = '';
const isLoading = false;

// Constants
const MAX_ITEMS = 100;
const API_URL = '';

// Private (conventionnel)
const _privateFunction = () => { };
```

### CSS & Styling

**Utiliser Tailwind :**

```tsx
// ✅ FAIRE
<div className="flex items-center gap-2 p-4 bg-card rounded-lg">
  <h2 className="text-lg font-semibold">Title</h2>
</div>

// ❌ ÉVITER les styles inline
<div style={{ display: 'flex', padding: '16px' }}>
```

**Classes conditionnelles :**

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes'
)} />
```

### Imports

**Ordre des imports :**

```typescript
// 1. React & Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Libraries externes
import { toast } from 'sonner';
import { z } from 'zod';

// 3. Components internes
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Hooks & Utils
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/utils';

// 5. Types
import type { User } from '@prisma/client';
```

### Error Handling

**Pattern recommandé :**

```typescript
try {
  const result = await riskyOperation();
  toast.success('Operation successful');
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  
  // Type-safe error handling
  if (error instanceof z.ZodError) {
    toast.error('Validation failed', {
      description: error.errors[0].message
    });
  } else if (error.response?.status === 401) {
    toast.error('Unauthorized');
    router.push('/login');
  } else if (error.response?.status === 403) {
    toast.error('Forbidden');
  } else {
    toast.error('Something went wrong');
  }
  
  throw error; // Re-throw si besoin
}
```

### Comments

**Quand commenter :**

```typescript
// ✅ FAIRE - Expliquer le POURQUOI
// Using debounce to prevent excessive API calls
// during user typing
useEffect(() => {
  const timer = setTimeout(() => search(query), 300);
  return () => clearTimeout(timer);
}, [query]);

// ✅ FAIRE - Documenter les APIs publiques
/**
 * Exports findings data to CSV format
 * @param data - Array of findings to export
 * @param filename - Name of the file (without extension)
 */
export function exportToCSV(data: Finding[], filename: string) {
  // ...
}

// ❌ ÉVITER - Commenter l'évident
// Set loading to true
setLoading(true); // ❌ Pas utile
```

---

## 🔄 Git Workflow

### Commit Messages

**Format :**

```
Type: Short description (max 50 chars)

[Optional body: explain what and why (max 72 chars per line)]

[Optional footer: references to issues]
```

**Types :**
- `Add` : Nouvelle feature
- `Fix` : Bug fix
- `Update` : Modification feature existante
- `Refactor` : Refactoring sans changement fonctionnel
- `Docs` : Documentation
- `Style` : Formatting, whitespace
- `Test` : Ajout de tests
- `Chore` : Maintenance, dependencies

**Examples :**

```bash
# Good ✅
Add: CSV export functionality for findings
Fix: Pagination reset on filter change
Update: Improve search performance with debounce
Refactor: Extract validation logic to utils
Docs: Add API documentation for targets endpoint

# Bad ❌
fixed bug                    # Pas de type, vague
Updated stuff                # Pas descriptif
WIP                          # Pas de contexte
asdfasdf                     # Non professionnel
```

### Branch Naming

**Format :**
```
type/short-description
```

**Examples :**
```bash
feature/csv-export
feature/bulk-actions
fix/pagination-bug
fix/auth-redirect
docs/api-documentation
refactor/prisma-queries
test/findings-crud
```

### Workflow Standard

**1. Créer une branche depuis develop :**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/ma-feature
```

**2. Développer avec commits réguliers :**

```bash
# Travailler sur le code
git add .
git commit -m "Add: Initial CSV export component"

# Continuer le développement
git add .
git commit -m "Add: Download functionality to CSV export"

# Finaliser
git add .
git commit -m "Add: Tests for CSV export"
```

**3. Rebaser sur develop avant PR :**

```bash
git fetch origin
git rebase origin/develop

# Résoudre les conflits si nécessaire
# puis push
git push origin feature/ma-feature
```

**4. Créer Pull Request sur GitHub**

---

## 🔍 Pull Requests

### Avant de Soumettre

**Checklist :**

- [ ] Code suit les standards du projet
- [ ] Tous les tests passent (`npm run build`)
- [ ] Pas d'erreurs TypeScript (`npx tsc --noEmit`)
- [ ] Pas d'erreurs ESLint (`npm run lint`)
- [ ] Branch à jour avec develop
- [ ] Commits bien formatés
- [ ] Documentation mise à jour si nécessaire

### Template de PR

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Screenshots (if applicable)
Add screenshots here

## Testing
Describe how you tested your changes:
- [ ] Manual testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Related Issues
Closes #123
Related to #456
```

### Taille des PRs

**Recommandations :**

- 🟢 **Small** : < 200 lignes - Idéal !
- 🟡 **Medium** : 200-500 lignes - OK
- 🟠 **Large** : 500-1000 lignes - À diviser si possible
- 🔴 **Huge** : > 1000 lignes - Définitivement à diviser

**Pourquoi des petites PRs ?**
- Plus facile à reviewer
- Moins de risques de bugs
- Faster merge
- Meilleur feedback

---

## 🐛 Reporting Bugs

### Template de Bug Report

```markdown
## Bug Description
A clear and concise description of what the bug is.

## To Reproduce
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- OS: [e.g. Windows 11, macOS 14]
- Browser: [e.g. Chrome 120, Firefox 121]
- Version: [e.g. v1.2.3]

## Additional Context
Any other context about the problem.

## Possible Solution
(Optional) Suggest a fix or reason for the bug
```

### Priorité des Bugs

| Priority | Description | Example |
|----------|-------------|---------|
| 🔴 **Critical** | App inutilisable, perte de données | Cannot login, data deletion |
| 🟠 **High** | Feature majeure cassée | Cannot create findings |
| 🟡 **Medium** | Feature mineure cassée | Incorrect sorting |
| 🟢 **Low** | Cosmetic, typos | Button misaligned |

---

## 💡 Feature Requests

### Template de Feature Request

```markdown
## Feature Description
A clear and concise description of the feature.

## Problem it Solves
Describe the problem this feature would solve.

## Proposed Solution
Describe how you'd like it to work.

## Alternatives Considered
Describe any alternative solutions you've considered.

## Additional Context
Add any other context, screenshots, or mockups.

## Implementation Ideas
(Optional) Technical suggestions for implementation
```

---

## 👀 Code Review

### Pour les Reviewers

**Checklist de Review :**

- [ ] Code suit les standards
- [ ] Tests appropriés
- [ ] Documentation mise à jour
- [ ] Pas de code dupliqué
- [ ] Pas de secrets hardcodés
- [ ] Performance acceptable
- [ ] Security concerns adressés
- [ ] Edge cases considérés

**Comment Reviewer :**

```markdown
# Good feedback ✅
- "Consider using useMemo here to avoid recalculation on every render"
- "This could cause a memory leak. Suggestion: add cleanup in useEffect"
- "Great solution! Maybe add error handling for the API call?"

# Bad feedback ❌
- "This is wrong" (pas constructif)
- "Change everything" (trop vague)
- "I would have done it differently" (pas de justification)
```

**Types de commentaires :**

- **🟢 Nit** : Petits changements non-bloquants
- **🟡 Suggestion** : Amélioration recommandée
- **🔴 Issue** : Doit être changé avant merge
- **💡 Question** : Demande de clarification

### Pour les Contributors

**Répondre aux Reviews :**

- Répondez à tous les commentaires
- Expliquez vos choix si désaccord
- Faites les changements demandés
- Merciez les reviewers
- Soyez ouvert aux suggestions

**Après Approbation :**

```bash
# Squash commits si demandé
git rebase -i origin/develop

# Push final
git push origin feature/ma-feature --force-with-lease
```

---

## 📦 Release Process

### Semantic Versioning

Format : `MAJOR.MINOR.PATCH`

**MAJOR** : Breaking changes
```
v1.0.0 → v2.0.0
- API changes incompatibles
- Database schema changes
- Removed features
```

**MINOR** : New features (compatible)
```
v1.0.0 → v1.1.0
- New endpoints
- New UI features
- Enhancements
```

**PATCH** : Bug fixes
```
v1.0.0 → v1.0.1
- Bug fixes
- Security patches
- Performance improvements
```

### Release Workflow

**1. Préparer Release :**

```bash
# Créer branche release
git checkout -b release/v1.1.0 develop

# Update version dans package.json
npm version 1.1.0

# Update CHANGELOG.md
# Commit changes
git add .
git commit -m "Release: v1.1.0"
```

**2. Testing :**

```bash
# Run all tests
npm run build
npm run lint
# Run E2E tests (when available)
```

**3. Merge vers main :**

```bash
git checkout main
git merge release/v1.1.0
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main --tags
```

**4. Merge back vers develop :**

```bash
git checkout develop
git merge release/v1.1.0
git push origin develop
```

**5. Deploy :**

```bash
# Automatic deployment via Railway
# ou manual deployment
```

---

## 🎯 Bonnes Pratiques

### DRY (Don't Repeat Yourself)

```typescript
// ❌ Répétition
function formatUserName(user: User) {
  return `${user.firstName} ${user.lastName}`;
}
function formatAdminName(admin: Admin) {
  return `${admin.firstName} ${admin.lastName}`;
}

// ✅ Abstraction
function formatFullName(person: { firstName: string; lastName: string }) {
  return `${person.firstName} ${person.lastName}`;
}
```

### KISS (Keep It Simple, Stupid)

```typescript
// ❌ Trop complexe
function isEligible(user: User) {
  return ((user.age >= 18 && user.country === 'US') || 
          (user.age >= 16 && user.country === 'UK')) &&
         user.verified === true && user.status !== 'banned' ? true : false;
}

// ✅ Simple et clair
function isEligible(user: User) {
  if (user.status === 'banned' || !user.verified) {
    return false;
  }
  
  const minAge = user.country === 'US' ? 18 : 16;
  return user.age >= minAge;
}
```

### SOLID Principles

**Single Responsibility :**
```typescript
// ❌ Trop de responsabilités
class UserManager {
  saveUser() { }
  sendEmail() { }
  generateReport() { }
}

// ✅ Responsabilité unique
class UserRepository {
  saveUser() { }
}
class EmailService {
  sendEmail() { }
}
class ReportGenerator {
  generateReport() { }
}
```

---

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Community
- GitHub Discussions
- Discord Server (if available)
- Stack Overflow tag: `base44`

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Prisma Studio](https://www.prisma.io/studio)
- [Railway CLI](https://docs.railway.app/develop/cli)

---

## 🙏 Remerciements

Merci à tous les contributeurs qui rendent BASE44 meilleur !

**Hall of Fame :**
- Contributors list (à maintenir)

---

## 📞 Contact

- **Email** : dev@base44.com
- **GitHub Issues** : Pour questions techniques
- **Discussions** : Pour discussions générales

---

**Happy Contributing! 🎉**

© 2024 BASE44 - Professional Security Audit Platform
