import { generateRegistrationOptions } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, userId } = body;
  
  // Get user from session to ensure security
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Generate registration options
  const options = await generateRegistrationOptions({
    rpName: 'YOKK',
    rpID: 'localhost', // TODO: Change to production domain
    userID: new TextEncoder().encode(user.id),
    userName: username || user.email || 'User',
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
  });

  // TODO: Save challenge to DB (redis or postgres) to verify later
  // For now, we rely on the client sending it back (less secure, strictly for prototype)
  
  return NextResponse.json(options);
}
