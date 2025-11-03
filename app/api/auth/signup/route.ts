import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validations';
import { createdResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = signupSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return validationErrorResponse(errors);
    }

    const { email, password, fullName, companyName } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle company creation or assignment
    let company;
    
    if (companyName) {
      // Check if company exists
      const existingCompany = await prisma.company.findFirst({
        where: {
          OR: [
            { name: companyName },
            { domain: email.split('@')[1] },
          ],
        },
      });

      if (existingCompany) {
        company = existingCompany;
      } else {
        // Create new company
        company = await prisma.company.create({
          data: {
            name: companyName,
            domain: email.split('@')[1],
            description: `${companyName} - Created during signup`,
          },
        });
      }
    } else {
      // Use default company or first available
      company = await prisma.company.findFirst({
        where: {
          name: 'Default Company',
        },
      });

      if (!company) {
        // Create default company if it doesn't exist
        company = await prisma.company.create({
          data: {
            name: 'Default Company',
            domain: 'example.com',
            description: 'Default company for new users',
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
        role: 'CLIENT', // Default role for new signups
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
        message: `Welcome ${fullName}! Your account has been created successfully. Start by exploring the dashboard and creating your first penetration test.`,
        type: 'SUCCESS',
        userId: user.id,
      },
    });

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      company: {
        id: company.id,
        name: company.name,
        domain: company.domain,
      },
      createdAt: user.createdAt,
    };

    return createdResponse(userData, 'Account created successfully');
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid input data', 400);
    }

    return errorResponse('Failed to create account', 500);
  }
}
