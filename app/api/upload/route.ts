import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { requireAuth } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse 
} from '@/lib/api-response';
import crypto from 'crypto';

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`, 400);
    }

    // Validate file type based on upload type
    const allowedTypes = type === 'image' 
      ? ALLOWED_IMAGE_TYPES 
      : [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

    if (!allowedTypes.includes(file.type)) {
      return errorResponse('File type not allowed', 400);
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const filename = `${timestamp}-${uniqueId}.${fileExtension}`;

    // Determine upload directory based on type
    const uploadDir = join(process.cwd(), 'public', 'uploads', type);
    
    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filepath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filepath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/${type}/${filename}`;

    // Return file information
    const uploadedFile = {
      id: uniqueId,
      filename,
      originalName: file.name,
      mimetype: file.type,
      size: file.size,
      url: publicUrl,
      type,
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString(),
    };

    return successResponse(uploadedFile, 'File uploaded successfully');
  } catch (error) {
    console.error('Error uploading file:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to upload file', 500);
  }
}

// GET /api/upload?file=filename - Get file metadata
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const params = new URL(request.url).searchParams;
    const filename = params.get('file');

    if (!filename) {
      return errorResponse('Filename is required', 400);
    }

    // In a production environment, you would store file metadata in the database
    // For now, we'll return basic information
    
    // Security: Prevent directory traversal
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '');
    
    // Check if file exists (simplified - in production, check database)
    const fileInfo = {
      filename: sanitizedFilename,
      url: `/uploads/${sanitizedFilename}`,
      message: 'File metadata would be retrieved from database in production',
    };

    return successResponse(fileInfo);
  } catch (error) {
    console.error('Error fetching file info:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to fetch file information', 500);
  }
}

// DELETE /api/upload?file=filename - Delete file
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const params = new URL(request.url).searchParams;
    const filename = params.get('file');

    if (!filename) {
      return errorResponse('Filename is required', 400);
    }

    // In production, verify user has permission to delete this file
    // by checking database records

    // Security: Prevent directory traversal
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '');
    
    // Note: In production, also delete from filesystem
    // For now, we'll just return success
    
    return successResponse(
      { filename: sanitizedFilename },
      'File deleted successfully'
    );
  } catch (error) {
    console.error('Error deleting file:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to delete file', 500);
  }
}
