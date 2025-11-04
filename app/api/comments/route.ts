// Exemple: app/api/comments/route.ts modifié pour Pusher
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  sendNotificationToUser, 
  broadcastToCompany,
  notifyNewComment 
} from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { content, findingId } = body;

    // Créer le commentaire
    const comment = await prisma.comment.create({
      data: {
        content,
        findingId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        finding: {
          select: {
            id: true,
            title: true,
            pentestId: true,
          },
        },
      },
    });

    // ANCIEN CODE WEBSOCKET (supprimé) :
    // wsServer.broadcastToCompany(session.user.companyId, 'new-comment', comment);

    // NOUVEAU CODE PUSHER :
    // Notifier tous les utilisateurs de la compagnie via Pusher
    await notifyNewComment(session.user.companyId, {
      id: comment.id,
      content: comment.content,
      author: comment.author.fullName,
      finding: comment.finding.title,
      timestamp: new Date().toISOString(),
    });

    // Notifier l'auteur de la découverte
    const finding = await prisma.finding.findUnique({
      where: { id: findingId },
      select: { 
        assignedTo: { 
          select: { id: true } 
        } 
      },
    });

    if (finding?.assignedTo && finding.assignedTo.id !== session.user.id) {
      await sendNotificationToUser(finding.assignedTo.id, {
        type: 'comment',
        message: `${session.user.name} a commenté votre découverte`,
        findingId: findingId,
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Erreur création commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const findingId = searchParams.get('findingId');

    const comments = await prisma.comment.findMany({
      where: findingId ? { findingId } : undefined,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Erreur récupération commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    );
  }
}
