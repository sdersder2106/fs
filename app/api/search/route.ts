import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';
import { handleApiError, successResponse, getQueryParams } from '@/lib/api-response';

// GET /api/search - Global search across resources
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const params = getQueryParams(request.url);
    const query = params.q || params.query || '';
    const type = params.type; // Optional: filter by type

    if (!query || query.length < 2) {
      return successResponse({
        results: [],
        query,
        message: 'Please enter at least 2 characters to search',
      });
    }

    // Build where clause based on user role
    const baseWhere: any = {};
    if (user.role === 'CLIENT' && user.companyId) {
      baseWhere.companyId = user.companyId;
    }

    const searchResults: any[] = [];

    // Search pentests
    if (!type || type === 'pentest') {
      const pentests = await prisma.pentest.findMany({
        where: {
          ...baseWhere,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
        },
      });

      searchResults.push(
        ...pentests.map((p) => ({
          type: 'pentest',
          id: p.id,
          title: p.title,
          description: p.description,
          status: p.status,
          url: `/dashboard/pentests/${p.id}`,
        }))
      );
    }

    // Search findings
    if (!type || type === 'finding') {
      const findings = await prisma.finding.findMany({
        where: {
          ...baseWhere,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { solution: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          description: true,
          severity: true,
          status: true,
        },
      });

      searchResults.push(
        ...findings.map((f) => ({
          type: 'finding',
          id: f.id,
          title: f.title,
          description: f.description,
          severity: f.severity,
          status: f.status,
          url: `/dashboard/findings/${f.id}`,
        }))
      );
    }

    // Search targets
    if (!type || type === 'target') {
      const targets = await prisma.target.findMany({
        where: {
          ...baseWhere,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { host: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          status: true,
        },
      });

      searchResults.push(
        ...targets.map((t) => ({
          type: 'target',
          id: t.id,
          title: t.name,
          description: t.description,
          targetType: t.type,
          status: t.status,
          url: `/dashboard/targets/${t.id}`,
        }))
      );
    }

    // Search reports
    if (!type || type === 'report') {
      const reports = await prisma.report.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
          ],
          pentest: baseWhere,
        },
        take: 5,
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          generatedAt: true,
        },
      });

      searchResults.push(
        ...reports.map((r) => ({
          type: 'report',
          id: r.id,
          title: r.title,
          reportType: r.type,
          status: r.status,
          generatedAt: r.generatedAt,
          url: `/dashboard/reports/${r.id}`,
        }))
      );
    }

    // Sort results by relevance (simple title match priority)
    searchResults.sort((a, b) => {
      const aMatch = a.title.toLowerCase().indexOf(query.toLowerCase());
      const bMatch = b.title.toLowerCase().indexOf(query.toLowerCase());
      
      if (aMatch === -1 && bMatch === -1) return 0;
      if (aMatch === -1) return 1;
      if (bMatch === -1) return -1;
      
      return aMatch - bMatch;
    });

    return successResponse({
      results: searchResults.slice(0, 20), // Limit total results
      query,
      total: searchResults.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
