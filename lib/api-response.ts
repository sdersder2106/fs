import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Success response
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Success response with message
 */
export function successWithMessage<T>(data: T, message: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

/**
 * Error response
 */
export function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

/**
 * Validation error response (from Zod)
 */
export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation error',
      details: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    },
    { status: 400 }
  );
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  );
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message = 'Forbidden: Access denied') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 403 }
  );
}

/**
 * Not found response
 */
export function notFoundResponse(resource = 'Resource') {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} not found`,
    },
    { status: 404 }
  );
}

/**
 * Server error response
 */
export function serverErrorResponse(message = 'Internal server error') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 500 }
  );
}

/**
 * Handle API errors
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  // Zod validation error
  if (error instanceof ZodError) {
    return validationErrorResponse(error);
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      return errorResponse('A record with this value already exists', 409);
    }
    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return errorResponse('Related record not found', 400);
    }
    // Record not found
    if (error.code === 'P2025') {
      return notFoundResponse();
    }
  }

  // Custom error messages
  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    if (error.message.startsWith('Forbidden')) {
      return forbiddenResponse(error.message);
    }
  }

  // Generic server error
  return serverErrorResponse();
}

/**
 * Paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
