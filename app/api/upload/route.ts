import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getAuthUser } from '@/lib/auth-helpers';
import { handleApiError, successResponse, errorResponse } from '@/lib/api-response';

// POST /api/upload - Upload file
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return errorResponse('File size exceeds 10MB limit', 400);
    }

    // Validate file type (images and PDFs only)
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Only images and PDFs are allowed', 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return file URL
    const fileUrl = `/uploads/${filename}`;

    return successResponse({
      url: fileUrl,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date(),
      uploadedBy: user.id,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/upload - Get upload info (optional)
export async function GET() {
  try {
    await getAuthUser();

    return successResponse({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
      ],
      uploadPath: '/uploads',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
