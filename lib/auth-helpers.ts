import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
  companyName?: string;
  image?: string | null;
}

// Get current user from session
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { company: true },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      companyId: user.companyId,
      companyName: user.company.name,
      image: user.avatar,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Check if user has specific role
export async function hasRole(role: string | string[]): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  return hasRole('ADMIN');
}

// Check if user is pentester
export async function isPentester(): Promise<boolean> {
  return hasRole(['ADMIN', 'PENTESTER']);
}

// Check if user can access company
export async function canAccessCompany(companyId: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  // Admins can access their own company
  // In a multi-tenant setup, you might allow super admins to access all
  return user.companyId === companyId;
}

// Create new user (for signup)
export async function createUser(data: {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
  role?: string;
}) {
  try {
    const { email, password, fullName, companyName, role = 'CLIENT' } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create or find company
    let company;
    if (companyName) {
      // Create new company
      company = await prisma.company.create({
        data: {
          name: companyName,
          domain: email.split('@')[1],
        },
      });
    } else {
      // Use default company or first company (for demo)
      company = await prisma.company.findFirst();
      
      if (!company) {
        // Create default company if none exists
        company = await prisma.company.create({
          data: {
            name: 'Default Company',
            domain: 'example.com',
          },
        });
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        fullName,
        role,
        companyId: company.id,
      },
      include: {
        company: true,
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        title: 'Welcome to Base44!',
        message: `Welcome ${fullName}! Your account has been created successfully. Start by exploring the dashboard.`,
        type: 'SUCCESS',
        userId: user.id,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      companyId: user.companyId,
      companyName: user.company.name,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user password
export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

// Validate user credentials (for login)
export async function validateCredentials(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { company: true },
    });

    if (!user || !user.password) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      companyId: user.companyId,
      companyName: user.company.name,
      image: user.avatar,
    };
  } catch (error) {
    console.error('Error validating credentials:', error);
    return null;
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      companyId: user.companyId,
      companyName: user.company.name,
      phone: user.phone,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(userId: string, data: {
  fullName?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: { company: true },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      companyId: user.companyId,
      companyName: user.company.name,
      phone: user.phone,
      bio: user.bio,
      avatar: user.avatar,
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Check authentication status (for API routes)
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

// Require specific role (for API routes)
export async function requireRole(role: string | string[]) {
  const user = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];

  if (!roles.includes(user.role)) {
    throw new Error('Forbidden');
  }

  return user;
}

// Require admin role
export async function requireAdmin() {
  return requireRole('ADMIN');
}

// Require pentester role
export async function requirePentester() {
  return requireRole(['ADMIN', 'PENTESTER']);
}
