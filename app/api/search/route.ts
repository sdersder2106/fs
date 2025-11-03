import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  getQueryParams 
} from '@/lib/api-response';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SearchResult {
  id: string;
  type: 'pentest' | 'target' | 'finding' | 'report';
  title: string;
  description?: string;
  severity?: string;
  status?: string;
  score?: number;
  date?: string;
  url?: string;
  highlight?: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const params = getQueryParams(request);
    
    // Parse search parameters
    const query = params.get('q') || '';
    const types = params.get('type')?.split(',') || ['pentest', 'target', 'finding', 'report'];
    const severity = params.get('severity')?.split(',');
    const status = params.get('status')?.split(',');
    const fromDate = params.get('from');
    const toDate = params.get('to');
    const minRisk = params.get('minRisk');
    const maxRisk = params.get('maxRisk');
    const minCvss = params.get('minCvss');
    const maxCvss = params.get('maxCvss');
    const limit = parseInt(params.get('limit') || '20');
    
    const results: SearchResult[] = [];
    
    // Search Pentests
    if (types.includes('pentest')) {
      const pentests = await prisma.pentest.findMany({
        where: {
          companyId: user.companyId,
          AND: [
            query ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { methodology: { contains: query, mode: 'insensitive' } },
              ],
            } : {},
            status?.length ? { status: { in: status } } : {},
            fromDate ? { createdAt: { gte: new Date(fromDate) } } : {},
            toDate ? { createdAt: { lte: new Date(toDate) } } : {},
          ],
        },
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          progress: true,
          createdAt: true,
        },
      });
      
      pentests.forEach(pentest => {
        results.push({
          id: pentest.id,
          type: 'pentest',
          title: pentest.title,
          description: pentest.description || undefined,
          status: pentest.status,
          score: pentest.progress,
          date: pentest.createdAt.toISOString(),
          highlight: query ? highlightMatch(pentest.title + ' ' + (pentest.description || ''), query) : undefined,
        });
      });
    }
    
    // Search Targets
    if (types.includes('target')) {
      const targets = await prisma.target.findMany({
        where: {
          companyId: user.companyId,
          AND: [
            query ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { url: { contains: query, mode: 'insensitive' } },
                { ipAddress: { contains: query, mode: 'insensitive' } },
              ],
            } : {},
            status?.length ? { status: { in: status } } : {},
            minRisk ? { riskScore: { gte: parseInt(minRisk) } } : {},
            maxRisk ? { riskScore: { lte: parseInt(maxRisk) } } : {},
            fromDate ? { createdAt: { gte: new Date(fromDate) } } : {},
            toDate ? { createdAt: { lte: new Date(toDate) } } : {},
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          status: true,
          riskScore: true,
          url: true,
          createdAt: true,
        },
      });
      
      targets.forEach(target => {
        results.push({
          id: target.id,
          type: 'target',
          title: target.name,
          description: target.description || undefined,
          status: target.status,
          score: target.riskScore,
          url: target.url || undefined,
          date: target.createdAt.toISOString(),
          highlight: query ? highlightMatch(target.name + ' ' + (target.description || ''), query) : undefined,
        });
      });
    }
    
    // Search Findings
    if (types.includes('finding')) {
      const findings = await prisma.finding.findMany({
        where: {
          companyId: user.companyId,
          AND: [
            query ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } },
                { proofOfConcept: { contains: query, mode: 'insensitive' } },
                { remediation: { contains: query, mode: 'insensitive' } },
              ],
            } : {},
            severity?.length ? { severity: { in: severity } } : {},
            status?.length ? { status: { in: status } } : {},
            minCvss ? { cvssScore: { gte: parseFloat(minCvss) } } : {},
            maxCvss ? { cvssScore: { lte: parseFloat(maxCvss) } } : {},
            fromDate ? { createdAt: { gte: new Date(fromDate) } } : {},
            toDate ? { createdAt: { lte: new Date(toDate) } } : {},
          ],
        },
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          severity: true,
          status: true,
          cvssScore: true,
          category: true,
          createdAt: true,
        },
      });
      
      findings.forEach(finding => {
        results.push({
          id: finding.id,
          type: 'finding',
          title: finding.title,
          description: finding.description,
          severity: finding.severity,
          status: finding.status,
          score: finding.cvssScore,
          date: finding.createdAt.toISOString(),
          highlight: query ? highlightMatch(finding.title + ' ' + finding.description, query) : undefined,
        });
      });
    }
    
    // Search Reports
    if (types.includes('report')) {
      const reports = await prisma.report.findMany({
        where: {
          companyId: user.companyId,
          AND: [
            query ? {
              title: { contains: query, mode: 'insensitive' },
            } : {},
            status?.length ? { status: { in: status } } : {},
            fromDate ? { generatedAt: { gte: new Date(fromDate) } } : {},
            toDate ? { generatedAt: { lte: new Date(toDate) } } : {},
          ],
        },
        take: limit,
        select: {
          id: true,
          title: true,
          reportType: true,
          status: true,
          format: true,
          fileUrl: true,
          generatedAt: true,
        },
      });
      
      reports.forEach(report => {
        results.push({
          id: report.id,
          type: 'report',
          title: report.title,
          description: `${report.reportType} - ${report.format}`,
          status: report.status,
          url: report.fileUrl || undefined,
          date: report.generatedAt.toISOString(),
          highlight: query ? highlightMatch(report.title, query) : undefined,
        });
      });
    }
    
    // Sort results by relevance (simple scoring based on title match)
    if (query) {
      results.sort((a, b) => {
        const aScore = calculateRelevanceScore(a, query);
        const bScore = calculateRelevanceScore(b, query);
        return bScore - aScore;
      });
    } else {
      // Sort by date if no query
      results.sort((a, b) => {
        const aDate = a.date ? new Date(a.date).getTime() : 0;
        const bDate = b.date ? new Date(b.date).getTime() : 0;
        return bDate - aDate;
      });
    }
    
    // Limit total results
    const limitedResults = results.slice(0, limit);
    
    // Track search query for analytics (optional)
    if (query) {
      await trackSearchQuery(user.id, query, limitedResults.length);
    }
    
    return successResponse({
      results: limitedResults,
      total: limitedResults.length,
      query,
      filters: {
        types,
        severity,
        status,
        dateRange: { from: fromDate, to: toDate },
        riskScore: { min: minRisk, max: maxRisk },
        cvssScore: { min: minCvss, max: maxCvss },
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return unauthorizedResponse();
      }
    }
    
    return errorResponse('Failed to perform search', 500);
  }
}

// Helper function to highlight matching text
function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const highlighted = text.replace(regex, '<mark>$1</mark>');
  
  // Extract a snippet around the match
  const matchIndex = text.toLowerCase().indexOf(query.toLowerCase());
  if (matchIndex === -1) return text.substring(0, 150) + '...';
  
  const start = Math.max(0, matchIndex - 50);
  const end = Math.min(text.length, matchIndex + query.length + 50);
  
  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  
  return snippet.replace(regex, '<mark>$1</mark>');
}

// Helper function to calculate relevance score
function calculateRelevanceScore(result: SearchResult, query: string): number {
  let score = 0;
  const queryLower = query.toLowerCase();
  
  // Title match (highest weight)
  if (result.title.toLowerCase().includes(queryLower)) {
    score += 10;
    if (result.title.toLowerCase().startsWith(queryLower)) {
      score += 5; // Bonus for prefix match
    }
  }
  
  // Description match
  if (result.description?.toLowerCase().includes(queryLower)) {
    score += 5;
  }
  
  // Type-specific boosts
  if (result.type === 'finding' && result.severity === 'CRITICAL') {
    score += 3;
  } else if (result.type === 'finding' && result.severity === 'HIGH') {
    score += 2;
  }
  
  if (result.type === 'target' && result.score && result.score > 70) {
    score += 2;
  }
  
  // Status boost for active/open items
  if (result.status === 'OPEN' || result.status === 'IN_PROGRESS' || result.status === 'ACTIVE') {
    score += 1;
  }
  
  return score;
}

// Helper function to track search queries for analytics
async function trackSearchQuery(userId: string, query: string, resultsCount: number) {
  try {
    // This could be stored in a separate analytics table
    // For now, we'll just log it
    console.log('Search query:', {
      userId,
      query,
      resultsCount,
      timestamp: new Date(),
    });
    
    // In production, you might want to:
    // - Store in a search_queries table
    // - Track popular searches
    // - Build search suggestions
    // - Analyze search patterns
  } catch (error) {
    console.error('Error tracking search query:', error);
    // Don't fail the search if analytics fails
  }
}
