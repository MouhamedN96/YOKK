import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const options = await generateAuthenticationOptions({
    rpID: 'localhost', // TODO: Env var
    userVerification: 'preferred',
  });

  // TODO: Save challenge to DB

  return NextResponse.json(options);
}
