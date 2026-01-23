import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { response, challenge } = body;

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
         return NextResponse.json({ error: 'User must be logged in for step-up auth' }, { status: 401 });
    }

    const { data: keyData, error } = await supabase
        .from('user_security_keys')
        .select('*')
        .eq('credential_id', response.id)
        .eq('user_id', user.id) 
        .single();

    if (error || !keyData) {
        return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      expectedRPID: process.env.NEXT_PUBLIC_RP_ID || 'localhost',
      credential: {
          id: keyData.credential_id, // Pass as string (Base64URL)
          publicKey: isoBase64URL.toBuffer(keyData.credential_public_key), // Pass as Buffer
          counter: keyData.counter,
          transports: keyData.transports || []
      }
    });

    if (verification.verified) {
        await supabase.from('user_security_keys')
            .update({ 
                counter: verification.authenticationInfo.newCounter,
                last_used_at: new Date().toISOString()
            })
            .eq('id', keyData.id);

        return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });

  } catch (e: any) {
    console.error('Auth Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
