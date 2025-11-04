import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const companyId = (session.user as any).companyId;

    // Verify user has access to the channel
    if (channelName.startsWith('private-user-')) {
      const requestedUserId = channelName.replace('private-user-', '');
      if (requestedUserId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (channelName.startsWith('private-company-')) {
      const requestedCompanyId = channelName.replace('private-company-', '');
      if (requestedCompanyId !== companyId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const auth = pusher.authorizeChannel(socketId, channelName, {
      user_id: userId,
      user_info: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
    });

    return NextResponse.json(auth);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
