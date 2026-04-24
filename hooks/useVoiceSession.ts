'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export type VoiceSessionStatus = 'idle' | 'connecting' | 'connected' | 'error'

export interface VoiceSessionHook {
  status: VoiceSessionStatus
  subtitle: string
  connect: () => Promise<void>
  disconnect: () => void
  sendAudio: (chunk: ArrayBuffer) => void
}

const ENGINE_WS_URL = process.env.NEXT_PUBLIC_ENGINE_URL
  ? process.env.NEXT_PUBLIC_ENGINE_URL.replace(/^http/, 'ws')
  : ''

export function useVoiceSession(): VoiceSessionHook {
  const wsRef = useRef<WebSocket | null>(null)
  const [status, setStatus] = useState<VoiceSessionStatus>('idle')
  const [subtitle, setSubtitle] = useState('')

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setStatus('idle')
    setSubtitle('')
  }, [])

  const connect = useCallback(async () => {
    if (wsRef.current) return

    setStatus('connecting')
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) {
      setStatus('error')
      return
    }

    const url = `${ENGINE_WS_URL}/api/voice/session?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected')
      ws.send(JSON.stringify({ type: 'session_config', sample_rate: 16000 }))
    }

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.type === 'subtitle' && msg.text) {
          setSubtitle(msg.text)
        }
      } catch {
        // binary audio frame — ignore on this side
      }
    }

    ws.onerror = () => setStatus('error')
    ws.onclose = () => {
      wsRef.current = null
      setStatus('idle')
    }
  }, [])

  const sendAudio = useCallback((chunk: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(chunk)
    }
  }, [])

  useEffect(() => () => { wsRef.current?.close() }, [])

  return { status, subtitle, connect, disconnect, sendAudio }
}
