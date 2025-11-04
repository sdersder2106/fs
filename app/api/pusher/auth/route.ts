import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Initialiser Pusher avec vos credentials
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '2072966',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '0ad42094e8713af8969b',
  secret: process.env.PUSHER_SECRET || '9c3e8d55a6c9ade97ee7',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
  useTLS: true,
});

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' }, 
        { status: 401 }
      );
    }

    // Récupérer les données du formulaire
    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channelName = formData.get('channel_name') as string;

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: 'Paramètres manquants' }, 
        { status: 400 }
      );
    }

    // Récupérer l'ID utilisateur et compagnie de la session
    const userId = session.user.id;
    const companyId = session.user.companyId;

    // Vérifier les permissions pour le canal
    const allowedChannels = [
      `private-user-${userId}`,
      `private-company-${companyId}`,
    ];

    if (!allowedChannels.includes(channelName)) {
      console.log(`❌ Accès refusé au canal: ${channelName}`);
      return NextResponse.json(
        { error: 'Accès refusé à ce canal' }, 
        { status: 403 }
      );
    }

    // Autoriser le canal
    const authResponse = pusher.authorizeChannel(socketId, channelName, {
      user_id: userId,
      user_info: {
        name: session.user.name || 'Utilisateur',
        email: session.user.email,
      },
    });

    console.log(`✅ Canal autorisé: ${channelName} pour l'utilisateur: ${userId}`);
    
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('❌ Erreur auth Pusher:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' }, 
      { status: 500 }
    );
  }
}
