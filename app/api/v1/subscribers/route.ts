import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/data/repository';
import { subscriberSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = subscriberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    }
    const subscriber = addSubscriber(parsed.data.email);
    return NextResponse.json({ subscriber }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}
