import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const pusher = new Pusher({
  appId: '2072966',
  key: '0ad42094e8713af8969b',
  secret: '9c3e8d55a6c9ade97ee7',
  cluster: 'eu',
  useTLS: true,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channelName = formData.get('channel_name') as string;

    const userId = session.user.id;
    const companyId = session.user.companyId;

    if (channelName === `private-user-${userId}` ||
        channelName === `private-company-${companyId}`) {
      const authResponse = pusher.authorizeChannel(socketId, channelName);
      return NextResponse.json(authResponse);
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}