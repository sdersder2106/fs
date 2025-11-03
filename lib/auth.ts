import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'email@example.com'
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: '••••••••'
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { 
            email: credentials.email.toLowerCase() 
          },
          include: { 
            company: true 
          },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        // Return user object for JWT
        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company.name,
          image: user.avatar,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.companyId = user.companyId;
        token.companyName = user.companyName;
        token.image = user.image;
      }

      // Update session
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.email = session.email;
        token.image = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string;
        session.user.companyName = token.companyName as string;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl + '/dashboard';
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log(`User ${user.email} signed in`);
    },
    async signOut({ session, token }) {
      console.log(`User signed out`);
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// Helper function to get server session
export { getServerSession } from 'next-auth';
