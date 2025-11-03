import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Success response
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: ApiResponse['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    meta,
  });
}

// Error response
export function errorResponse(
  error: string | Error | ZodError | unknown,
  status: number = 400
): NextResponse<ApiResponse> {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        errors,
      },
      { status: 400 }
    );
  }
  
  // Handle Error instances
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in to perform this action',
        },
        { status: 401 }
      );
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to perform this action',
        },
        { status: 403 }
      );
    }
    
    if (error.message === 'Not Found') {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'The requested resource was not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status }
    );
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status }
    );
  }
  
  // Default error
  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

// Not found response
export function notFoundResponse(resource: string = 'Resource'): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Not Found',
      message: `${resource} not found`,
    },
    { status: 404 }
  );
}

// Unauthorized response
export function unauthorizedResponse(message?: string): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
      message: message || 'You must be logged in to perform this action',
    },
    { status: 401 }
  );
}

// Forbidden response
export function forbiddenResponse(message?: string): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Forbidden',
      message: message || 'You do not have permission to perform this action',
    },
    { status: 403 }
  );
}

// Validation error response
export function validationErrorResponse(errors: Record<string, string[]>): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      errors,
    },
    { status: 400 }
  );
}

// Created response (201)
export function createdResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || 'Resource created successfully',
    },
    { status: 201 }
  );
}

// Updated response
export function updatedResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message: message || 'Resource updated successfully',
  });
}

// Deleted response
export function deletedResponse(message?: string): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: true,
    message: message || 'Resource deleted successfully',
  });
}

// Paginated response
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(total / limit);
  
  return NextResponse.json({
    success: true,
    data,
    message,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}

// Handle API errors
export async function handleApiError(error: unknown): Promise<NextResponse<ApiResponse>> {
  console.error('API Error:', error);
  
  if (error instanceof ZodError) {
    return errorResponse(error, 400);
  }
  
  if (error instanceof Error) {
    // Prisma errors
    if ('code' in error) {
      const prismaError = error as any;
      
      // Unique constraint violation
      if (prismaError.code === 'P2002') {
        return errorResponse('A record with this value already exists', 409);
      }
      
      // Foreign key constraint violation
      if (prismaError.code === 'P2003') {
        return errorResponse('Referenced record does not exist', 400);
      }
      
      // Record not found
      if (prismaError.code === 'P2025') {
        return notFoundResponse();
      }
    }
    
    return errorResponse(error, 500);
  }
  
  return errorResponse('An unexpected error occurred', 500);
}

// Parse request body safely
export async function parseRequestBody<T>(request: Request): Promise<T | null> {
  try {
    const body = await request.json();
    return body as T;
  } catch {
    return null;
  }
}

// Get query parameters
export function getQueryParams(request: Request): URLSearchParams {
  const { searchParams } = new URL(request.url);
  return searchParams;
}

// Parse pagination parameters
export function getPaginationParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const skip = (page - 1) * limit;
  
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    skip: Math.max(0, skip),
  };
}

// Parse sort parameters
export function getSortParams(searchParams: URLSearchParams): {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
} {
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  
  return {
    sortBy,
    sortOrder,
  };
}

// Build Prisma where clause from filters
export function buildWhereClause(filters: Record<string, any>): any {
  const where: any = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    
    // Handle special cases
    if (key === 'query' || key === 'search') {
      // Text search
      where.OR = [
        { title: { contains: value, mode: 'insensitive' } },
        { description: { contains: value, mode: 'insensitive' } },
        { name: { contains: value, mode: 'insensitive' } },
      ];
    } else if (key.endsWith('From')) {
      // Date range - from
      const field = key.replace('From', '');
      where[field] = { ...where[field], gte: new Date(value) };
    } else if (key.endsWith('To')) {
      // Date range - to
      const field = key.replace('To', '');
      where[field] = { ...where[field], lte: new Date(value) };
    } else if (key.startsWith('min')) {
      // Minimum value
      const field = key.replace('min', '').toLowerCase();
      where[field] = { ...where[field], gte: value };
    } else if (key.startsWith('max')) {
      // Maximum value
      const field = key.replace('max', '').toLowerCase();
      where[field] = { ...where[field], lte: value };
    } else if (Array.isArray(value)) {
      // Array values - use IN
      where[key] = { in: value };
    } else {
      // Direct match
      where[key] = value;
    }
  });
  
  return where;
}

// Check if request is JSON
export function isJsonRequest(request: Request): boolean {
  const contentType = request.headers.get('content-type');
  return contentType?.includes('application/json') ?? false;
}

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Add CORS to response
export function withCors(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
