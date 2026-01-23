import { verifyRegistrationResponse } from '@simplewebauthn/server';
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge, 
      expectedOrigin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      expectedRPID: process.env.NEXT_PUBLIC_RP_ID || 'localhost',
    });

    if (verification.verified && verification.registrationInfo) {
      // Force cast to any to bypass version mismatch on property names if needed,
      // but standard destructuring works if we match v10+ structure.
      const { credential } = verification.registrationInfo;
      const { id, publicKey, counter, transports } = credential;

      // Encode bytes to string for storage
      const pubKey = isoBase64URL.fromBuffer(publicKey);
      
      // ID is already a Base64URL string in modern versions
      const credID = id;

      // Save credential to Supabase
      const { error } = await supabase.from('user_security_keys').insert({
        user_id: user.id,
        credential_id: credID,
        credential_public_key: pubKey,
        counter: counter,
        transports: transports || [],
        device_name: 'User Device' 
      });

      if (error) {
        console.error('DB Insert Error:', error);
        return NextResponse.json({ verified: false, error: 'Failed to save key' }, { status: 500 });
      }
      
      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (e: any) {
    console.error('Registration Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}