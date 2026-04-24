'use client'

import { useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface BoChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL ?? ''

export function useBoChat() {
  const [messages, setMessages] = useState<BoChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const append = useCallback(async (msg: { role: 'user' | 'assistant'; content: string }) => {
    const userMsg: BoChatMessage = { id: Date.now().toString(), ...msg }
    setMessages(prev => [...prev, userMsg])

    if (msg.role !== 'user') return

    setIsLoading(true)
    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      abortRef.current = new AbortController()
      const resp = await fetch(`${ENGINE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      })

      if (!resp.ok || !resp.body) {
        throw new Error(`Engine error: ${resp.status}`)
      }

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            const delta = parsed?.choices?.[0]?.delta?.content
            if (delta) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: m.content + delta } : m
                )
              )
            }
          } catch {
            // incomplete JSON chunk — continue
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: 'Connection error. Please try again.' }
              : m
          )
        )
      }
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    append({ role: 'user', content: text })
  }, [input, isLoading, append])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return {
    messages,
    input,
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setInput(e.target.value),
    handleSubmit,
    isLoading,
    append,
    stop,
  }
}
