# 🔧 DOCUMENTATION TECHNIQUE BASE44

## Guide du Développeur

Cette documentation technique détaille l'architecture, les composants, et les patterns utilisés dans BASE44.

---

## 📋 Table des Matières

1. [Architecture Générale](#architecture-générale)
2. [Structure du Projet](#structure-du-projet)
3. [Technologies](#technologies)
4. [Base de Données](#base-de-données)
5. [API Routes](#api-routes)
6. [Composants UI](#composants-ui)
7. [Hooks](#hooks)
8. [État Global](#état-global)
9. [Authentication](#authentication)
10. [Real-time](#real-time)
11. [Patterns & Conventions](#patterns--conventions)
12. [Tests](#tests)

---

## 🏗️ Architecture Générale

BASE44 utilise une **architecture moderne en couches** :

```
┌─────────────────────────────────────────┐
│            Next.js 14 (App Router)      │
├─────────────────────────────────────────┤
│  Presentation Layer (React Components)  │
├─────────────────────────────────────────┤
│   Business Logic (Hooks & Utils)        │
├─────────────────────────────────────────┤
│      API Layer (Route Handlers)         │
├─────────────────────────────────────────┤
│     Data Access (Prisma ORM)            │
├─────────────────────────────────────────┤
│      Database (PostgreSQL)              │
└─────────────────────────────────────────┘
```

### Principes de Design

1. **Separation of Concerns** : Chaque couche a sa responsabilité
2. **Component Reusability** : Composants réutilisables maximum
3. **Type Safety** : TypeScript partout
4. **Performance** : Server Components par défaut
5. **Security** : Validation et autorisation à tous les niveaux

---

## 📁 Structure du Projet

```
base44/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Routes d'authentification
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/              # Routes protégées
│   │   ├── dashboard/
│   │   ├── targets/
│   │   ├── pentests/
│   │   ├── findings/
│   │   ├── reports/
│   │   ├── users/
│   │   └── settings/
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── targets/
│   │   ├── pentests/
│   │   ├── findings/
│   │   └── ...
│   ├── layout.tsx                # Layout racine
│   └── globals.css               # Styles globaux
│
├── components/                   # Composants React
│   ├── ui/                       # Composants UI de base
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── auth/                     # Composants d'auth
│   ├── providers/                # Context providers
│   ├── export-csv.tsx            # Composants métier
│   ├── advanced-filters.tsx
│   └── ...
│
├── hooks/                        # Custom React Hooks
│   ├── use-auth.ts
│   ├── use-pagination.tsx
│   ├── use-keyboard-shortcuts.tsx
│   └── ...
│
├── lib/                          # Utilitaires et config
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # NextAuth config
│   ├── utils.ts                  # Fonctions utilitaires
│   └── toast.ts                  # Toast notifications
│
├── prisma/                       # Prisma schema et migrations
│   ├── schema.prisma             # Modèle de données
│   ├── seed.ts                   # Données de test
│   └── migrations/               # Migrations DB
│
├── public/                       # Fichiers statiques
│   ├── robots.txt
│   └── ...
│
├── types/                        # Types TypeScript
│   └── next-auth.d.ts
│
├── .env.example                  # Variables d'env exemple
├── next.config.js                # Config Next.js
├── tailwind.config.ts            # Config Tailwind
├── tsconfig.json                 # Config TypeScript
└── package.json                  # Dépendances
```

---

## 🛠️ Technologies

### Core Stack

| Tech | Version | Usage |
|------|---------|-------|
| **Next.js** | 14.2.5 | Framework React |
| **React** | 18.3 | Library UI |
| **TypeScript** | 5.3 | Type safety |
| **Tailwind CSS** | 3.4 | Styling |
| **Prisma** | 5.7 | ORM |
| **PostgreSQL** | 16+ | Database |
| **NextAuth.js** | 4.24 | Authentication |
| **Pusher** | 5.2 | Real-time |

### Libraries

| Library | Usage |
|---------|-------|
| **Radix UI** | Composants UI accessibles |
| **React Hook Form** | Gestion formulaires |
| **Zod** | Validation schémas |
| **Recharts** | Graphiques |
| **Sonner** | Toast notifications |
| **Lucide React** | Icônes |
| **bcryptjs** | Hash passwords |

---

## 🗄️ Base de Données

### Schéma Prisma

```prisma
// Modèle principal
model Company {
  id        String   @id @default(cuid())
  name      String
  // Relations
  users     User[]
  targets   Target[]
  pentests  Pentest[]
  findings  Finding[]
  // ...
}

model User {
  id       String @id @default(cuid())
  email    String @unique
  password String
  name     String
  role     Role   @default(CLIENT)
  // Relations
  company  Company @relation(fields: [companyId], references: [id])
  // ...
}

model Target {
  id              String           @id @default(cuid())
  name            String
  targetType      TargetType
  criticalityLevel CriticalityLevel
  // Relations
  company         Company          @relation(...)
  pentests        Pentest[]        @relation(...)
  findings        Finding[]
  // Indexes
  @@index([companyId])
  @@index([criticalityLevel])
}

// ... autres modèles
```

### Relations

**Company (1) → (N) Users**
- Multi-tenant architecture
- Isolation des données par company

**Target (N) ← → (M) Pentest**
- Relation many-to-many
- Un pentest peut tester plusieurs targets

**Pentest (1) → (N) Findings**
- Un finding appartient à un pentest

**Finding (N) → (1) Target**
- Un finding affecte un target

**Finding (1) → (N) Comments**
- Commentaires sur findings

### Indexes

```prisma
// Pour performance
@@index([companyId])          // Filtrage par company
@@index([status])             // Filtrage par status
@@index([severity])           // Filtrage par severity
@@index([createdAt])          // Tri chronologique
@@index([email])              // Recherche users
```

---

## 🔌 API Routes

### Structure des Routes

```
/api
├── /auth
│   ├── /[...nextauth]        # NextAuth endpoints
│   ├── /register             # POST - Register
│   └── /forgot-password      # POST - Reset password
│
├── /dashboard
│   └── /stats                # GET - Dashboard stats
│
├── /targets
│   ├── /                     # GET, POST
│   └── /[id]                 # GET, PUT, DELETE
│
├── /pentests
│   ├── /                     # GET, POST
│   └── /[id]                 # GET, PUT, DELETE
│
├── /findings
│   ├── /                     # GET, POST
│   ├── /[id]                 # GET, PUT, DELETE
│   └── /[id]/comments        # GET, POST
│
├── /templates                # GET, POST
├── /users                    # GET
├── /notifications            # GET, PUT, DELETE
├── /pusher
│   ├── /auth                 # POST - Auth channels
│   └── /trigger              # POST - Trigger events
│
└── /health                   # GET - Health check
```

### Pattern des Routes

**Structure standard :**

```typescript
// app/api/resource/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validation
const schema = z.object({
  name: z.string().min(1),
  // ...
});

// GET - Liste
export async function GET(request: Request) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');

    // 3. Database query avec filters
    const data = await prisma.resource.findMany({
      where: {
        companyId: session.user.companyId,
      },
      skip: (page - 1) * 10,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    // 4. Return response
    return NextResponse.json({
      data,
      page,
      totalPages: Math.ceil(total / 10),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Création
export async function POST(request: Request) {
  try {
    // 1. Auth & permission check
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role === 'CLIENT') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 2. Validation
    const body = await request.json();
    const validated = schema.parse(body);

    // 3. Database creation
    const item = await prisma.resource.create({
      data: {
        ...validated,
        companyId: session.user.companyId,
        createdById: session.user.id,
      },
    });

    // 4. Activity log
    await prisma.activityLog.create({
      data: {
        action: 'RESOURCE_CREATED',
        userId: session.user.id,
        resourceId: item.id,
      },
    });

    // 5. Return response
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Permissions

```typescript
// lib/permissions.ts
export const hasPermission = (
  user: User,
  action: string,
  resource: string
): boolean => {
  const permissions = {
    ADMIN: ['*'],
    AUDITOR: [
      'target:create',
      'target:read',
      'target:update',
      'pentest:*',
      'finding:*',
    ],
    CLIENT: [
      'target:read',
      'pentest:read',
      'finding:read',
      'comment:create',
    ],
  };

  const userPerms = permissions[user.role];
  return (
    userPerms.includes('*') ||
    userPerms.includes(`${resource}:*`) ||
    userPerms.includes(`${resource}:${action}`)
  );
};
```

---

## 🎨 Composants UI

### Hiérarchie des Composants

```
Components
├── UI Primitives (components/ui/)
│   ├── Button
│   ├── Input
│   ├── Card
│   ├── Badge
│   ├── Dialog
│   └── ...
│
├── Composite Components
│   ├── SearchInput
│   ├── AdvancedFilters
│   ├── ExportCSV
│   ├── BulkActions
│   └── StatsWidgets
│
├── Feature Components
│   ├── DashboardStats
│   ├── TargetCard
│   ├── FindingList
│   └── CommentSection
│
└── Layout Components
    ├── Sidebar
    ├── Header
    └── Footer
```

### Pattern des Composants

**Composant UI Primitif :**

```typescript
// components/ui/button.tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);

export { Button, buttonVariants };
```

**Composant Feature :**

```typescript
// components/target-card.tsx
import { Target } from '@prisma/client';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface TargetCardProps {
  target: Target;
  onClick?: () => void;
}

export function TargetCard({ target, onClick }: TargetCardProps) {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:bg-accent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{target.name}</CardTitle>
          <Badge className={getCriticalityColor(target.criticalityLevel)}>
            {target.criticalityLevel}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
}
```

---

## 🪝 Hooks

### Hooks Disponibles

**Authentication :**
```typescript
// hooks/use-auth.ts
export function useAuth() {
  const { data: session } = useSession();
  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
  };
}
```

**Pagination :**
```typescript
// hooks/use-pagination.tsx
export function usePagination<T>({
  data,
  itemsPerPage = 10,
}: UsePaginationProps<T>) {
  // State et logic
  return {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
  };
}
```

**Search :**
```typescript
// hooks/use-search.tsx
export function useSearch<T>(
  items: T[],
  searchKeys: (keyof T)[],
  initialQuery: string = ''
) {
  // Debounced search logic
  return {
    query,
    setQuery,
    filteredItems,
    isSearching,
  };
}
```

**Keyboard Shortcuts :**
```typescript
// hooks/use-keyboard-shortcuts.tsx
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[]
) {
  useEffect(() => {
    // Event listener logic
  }, [shortcuts]);
}
```

---

## 🌐 État Global

### Context Providers

**Auth Provider :**
```typescript
// components/providers/auth-provider.tsx
import { SessionProvider } from 'next-auth/react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

**Pusher Provider :**
```typescript
// components/providers/pusher-provider.tsx
export function PusherProvider({ children }: { children: React.ReactNode }) {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  
  useEffect(() => {
    // Initialize Pusher
    const client = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!);
    setPusher(client);
    
    return () => client.disconnect();
  }, []);
  
  return (
    <PusherContext.Provider value={{ pusher }}>
      {children}
    </PusherContext.Provider>
  );
}
```

### Pattern de Gestion d'État

**Server State (React Query pattern) :**
```typescript
// hooks/use-findings.ts
export function useFindings() {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/findings')
      .then(res => res.json())
      .then(setFindings)
      .finally(() => setLoading(false));
  }, []);
  
  return { findings, loading };
}
```

**Client State (useState/useReducer) :**
```typescript
// Pour état UI local
const [isOpen, setIsOpen] = useState(false);
const [selectedIds, setSelectedIds] = useState<string[]>([]);
```

---

## 🔐 Authentication

### NextAuth Configuration

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // 1. Validate credentials
        const { email, password } = credentials;
        
        // 2. Find user
        const user = await prisma.user.findUnique({
          where: { email },
          include: { company: true },
        });
        
        if (!user) {
          throw new Error('Invalid credentials');
        }
        
        // 3. Verify password
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
          throw new Error('Invalid credentials');
        }
        
        // 4. Return user
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.companyId = token.companyId;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
```

### Middleware Protection

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/targets/:path*', '/pentests/:path*'],
};
```

---

## 📡 Real-time

### Pusher Integration

**Server-side (Trigger) :**
```typescript
// app/api/findings/route.ts
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

// After creating finding
await pusher.trigger(
  `private-company-${companyId}`,
  'finding-created',
  {
    id: finding.id,
    title: finding.title,
    severity: finding.severity,
  }
);
```

**Client-side (Subscribe) :**
```typescript
// components/providers/pusher-provider.tsx
useEffect(() => {
  if (!pusher || !session) return;
  
  const channel = pusher.subscribe(`private-company-${companyId}`);
  
  channel.bind('finding-created', (data: any) => {
    toast.criticalFinding(data.title, data.id);
  });
  
  return () => {
    channel.unbind_all();
    pusher.unsubscribe(`private-company-${companyId}`);
  };
}, [pusher, session]);
```

---

## 📐 Patterns & Conventions

### Naming Conventions

**Files :**
- Components: `PascalCase.tsx` (ex: `TargetCard.tsx`)
- Hooks: `use-kebab-case.ts` (ex: `use-pagination.ts`)
- Utils: `kebab-case.ts` (ex: `format-date.ts`)
- API Routes: `route.ts`

**Variables :**
- React Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types: `PascalCase`

### File Organization

```typescript
// 1. Imports (grouped by type)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { formatDate } from '@/lib/utils';
import type { Target } from '@prisma/client';

// 2. Types & Interfaces
interface Props {
  target: Target;
}

// 3. Component
export function TargetCard({ target }: Props) {
  // 3.1 Hooks
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 3.2 Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 3.3 Handlers
  const handleClick = () => {
    // ...
  };
  
  // 3.4 Render
  return (
    <Card onClick={handleClick}>
      {/* ... */}
    </Card>
  );
}
```

### Error Handling

```typescript
// Consistent error handling pattern
try {
  const result = await apiCall();
  toast.success('Success!');
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  if (error instanceof z.ZodError) {
    toast.error('Validation failed');
  } else if (error.response?.status === 401) {
    toast.error('Unauthorized');
    router.push('/login');
  } else {
    toast.error('Something went wrong');
  }
  throw error;
}
```

---

## 🧪 Tests

### Structure de Tests (À implémenter)

```typescript
// __tests__/components/TargetCard.test.tsx
import { render, screen } from '@testing-library/react';
import { TargetCard } from '@/components/target-card';

describe('TargetCard', () => {
  it('renders target name', () => {
    const target = {
      id: '1',
      name: 'Test Target',
      criticalityLevel: 'HIGH',
    };
    
    render(<TargetCard target={target} />);
    
    expect(screen.getByText('Test Target')).toBeInTheDocument();
  });
});
```

### Testing Stack (Recommandé)

- **Unit Tests** : Jest + React Testing Library
- **Integration Tests** : Playwright
- **E2E Tests** : Playwright
- **API Tests** : Supertest

---

## 📊 Performance

### Optimizations Implémentées

1. **Server Components** : Par défaut pour réduire bundle JS
2. **Code Splitting** : Automatic avec Next.js
3. **Image Optimization** : Next/Image component
4. **Database Indexes** : Sur colonnes fréquemment requêtées
5. **Pagination** : Server-side pour grandes listes
6. **Debouncing** : Sur search inputs (300ms)
7. **Memoization** : useMemo pour calculs coûteux

### Monitoring

```typescript
// Health check endpoint
// GET /api/health
{
  "status": "healthy",
  "timestamp": "2024-11-04T10:00:00Z",
  "checks": {
    "database": "connected",
    "nextauth": "configured",
    "pusher": "configured"
  }
}
```

---

## 🔒 Security

### Measures Implémentées

1. **Authentication** : NextAuth.js avec JWT
2. **Authorization** : Role-based access control
3. **Input Validation** : Zod schemas partout
4. **SQL Injection** : Prisma (parameterized queries)
5. **XSS Protection** : React automatic escaping
6. **CSRF Protection** : NextAuth built-in
7. **Security Headers** : next.config.js
8. **Password Hashing** : bcryptjs (10 rounds)
9. **Environment Variables** : Jamais exposées au client

---

## 🚀 Déploiement

Voir **DEPLOYMENT_GUIDE.md** pour les instructions complètes.

---

## 📝 Contribution

### Workflow

1. Fork le repo
2. Créer une branche : `git checkout -b feature/ma-feature`
3. Commiter : `git commit -m "Add: ma feature"`
4. Push : `git push origin feature/ma-feature`
5. Créer une Pull Request

### Commit Convention

```
Type: Short description

Types:
- Add: Nouvelle feature
- Fix: Bug fix
- Update: Modification feature existante
- Refactor: Refactoring code
- Docs: Documentation
- Style: Formatting
- Test: Adding tests
- Chore: Maintenance

Example:
Add: Export CSV functionality for findings
```

---

## 📞 Support Développeurs

- **Documentation** : Ce fichier + autres guides
- **GitHub Issues** : Pour bugs et features
- **Code Review** : Obligatoire pour PRs

---

© 2024 BASE44 - Professional Security Audit Platform
