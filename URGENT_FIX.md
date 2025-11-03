# 🚨 FIX URGENT - PERFORMANCE & NAVIGATION

## PROBLÈMES IDENTIFIÉS
1. ❌ Navigation cassée (liens ne fonctionnent pas)
2. ❌ Performance très lente
3. ❌ Timeout de base de données

## SOLUTION RAPIDE

### 1. OPTIMISER LA BASE DE DONNÉES SUPABASE

Dans Supabase Dashboard → Settings → Database :

```sql
-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_finding_company ON "Finding"("companyId");
CREATE INDEX IF NOT EXISTS idx_pentest_company ON "Pentest"("companyId");
CREATE INDEX IF NOT EXISTS idx_target_company ON "Target"("companyId");
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"("email");
CREATE INDEX IF NOT EXISTS idx_user_company ON "User"("companyId");

-- Analyser les tables pour optimiser
ANALYZE "User";
ANALYZE "Company";
ANALYZE "Finding";
ANALYZE "Pentest";
ANALYZE "Target";
```

### 2. VARIABLES D'ENVIRONNEMENT À AJOUTER DANS VERCEL

Ajoutez ces nouvelles variables pour optimiser :

```env
# Optimisation de connexion
DATABASE_CONNECTION_LIMIT=3
DATABASE_POOL_TIMEOUT=10
NODE_OPTIONS="--max-old-space-size=256"

# Cache
CACHE_REVALIDATE_SECONDS=60
```

### 3. FIX RAPIDE DU CODE

**Modifiez lib/prisma.ts** :

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Optimisations pour Vercel
    errorFormat: 'minimal',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Nettoyer les connexions
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

### 4. FIX LA NAVIGATION

**Modifiez app/dashboard/layout.tsx** - Remplacez les Link par :

```tsx
import { useRouter } from 'next/navigation';

// Dans le composant
const router = useRouter();

// Remplacez les <Link> par :
<button
  onClick={() => router.push('/dashboard/pentests')}
  className="..."
>
  Pentests
</button>
```

### 5. REDÉPLOYER

```bash
git add .
git commit -m "fix: performance and navigation issues"
git push
```

## SOLUTION ALTERNATIVE IMMÉDIATE

Si les problèmes persistent, utilisez cette URL de connexion optimisée :

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10&statement_timeout=10000"
```

## TEST DE PERFORMANCE

Vérifiez sur : https://pagespeed.web.dev/

## SI TOUJOURS LENT

1. **Passez au plan Supabase Pro** (25$/mois) pour de meilleures performances
2. **Ou utilisez PlanetScale** (MySQL) qui a une meilleure performance gratuite
3. **Ou déployez sur Railway/Render** au lieu de Vercel

Le problème principal semble être la latence entre Vercel et Supabase.