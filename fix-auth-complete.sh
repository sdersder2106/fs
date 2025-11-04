#!/bin/bash
# fix-auth-complete.sh - Script complet pour corriger l'authentification

echo "🔧 Correction complète de l'authentification NextAuth"
echo "====================================================="

# 1. Créer app/page.tsx
echo "1️⃣ Création de app/page.tsx..."
cat > app/page.tsx << 'EOF'
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
}
EOF

# 2. Remplacer middleware.ts
echo "2️⃣ Remplacement de middleware.ts..."
cat > middleware.ts << 'EOF'
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuthPage = 
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/signup');
  
  const isPublicPage = 
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/_next');

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (token && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!token && !isAuthPage && !isPublicPage && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
EOF

# 3. Remplacer lib/auth.ts
echo "3️⃣ Remplacement de lib/auth.ts..."
cat > lib/auth.ts << 'EOF'
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true }
        });

        if (!user || !user.password) {
          return null;
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company?.name
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: user.companyName
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
          companyId: token.companyId as string,
          companyName: token.companyName as string
        }
      };
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};
EOF

# 4. Créer api/debug/route.ts pour vérifier
echo "4️⃣ Création de app/api/debug/route.ts..."
mkdir -p app/api/debug
cat > app/api/debug/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  return NextResponse.json({
    config: {
      nextauth_url: process.env.NEXTAUTH_URL || 'NOT SET',
      nextauth_secret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    },
    session: session || null,
    timestamp: new Date().toISOString()
  });
}
EOF

echo ""
echo "✅ Tous les fichiers ont été corrigés !"
echo ""
echo "5️⃣ Commit et push..."
git add .
git status
echo ""
echo "Exécutez maintenant :"
echo "  git commit -m 'fix: complete auth configuration'"
echo "  git push"
echo ""
echo "🔍 Après le déploiement, testez :"
echo "  1. https://fs-production-c597.up.railway.app/api/debug"
echo "  2. Connectez-vous sur /login"
echo "  3. Vérifiez que vous restez sur /dashboard"
