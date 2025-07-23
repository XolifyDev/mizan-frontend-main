// app/api/socket/route.ts
import { NextResponse } from 'next/server';
import { getSocket } from '@/lib/socket';

export async function GET(request: Request) {
  return NextResponse.json({ status: 'Socket ready' });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { masjidId } = body;

  const res = { socket: (req as any).socket }; // adapter to trick TS
  const io = getSocket(res);

  io.to(masjidId).emit('reload');
  return new Response('OK');
}
