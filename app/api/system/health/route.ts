import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check connection by selecting a public table (profiles)
    // We select 1 just to see if the connection is alive and RLS lets us read public data
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single()

    // Note: It might return error 'PGRST116' (JSON object requested, multiple (or no) rows returned)
    // if table is empty, which is fine for connection testing.
    // Real auth error would be 401/403.

    return NextResponse.json({ 
      status: 'online', 
      timestamp: new Date().toISOString(),
      db_response: { data, error } 
    })
  } catch (e: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: e.message 
    }, { status: 500 })
  }
}
