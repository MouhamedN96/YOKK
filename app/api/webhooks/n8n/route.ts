import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { z } from 'zod'

// Lazy-initialized Supabase admin client (avoids module-level env var access during build)
let _adminClient: ReturnType<typeof createClient> | null = null

function getSupabaseAdmin() {
  if (!_adminClient) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
    }
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return _adminClient
}

// Validation schemas
const RSSItemSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  content: z.string().max(5000).optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  image_url: z.string().url().optional().nullable(),
})

const ContentPostSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(5000),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  image_url: z.string().url().optional().nullable(),
})

// Rate limiting storage (in-memory for now, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + 60 * 60 * 1000, // 1 hour window
    })
    return true
  }

  if (limit.count >= 10) {
    // 10 requests per hour
    return false
  }

  limit.count++
  return true
}

// Webhook secret verification (timing-safe comparison)
function verifyWebhookSignature(request: NextRequest, _body: string): boolean {
  const signature = request.headers.get('x-n8n-signature')
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET

  // FAIL HARD if secret not configured - never allow unauthenticated requests
  if (!webhookSecret) {
    throw new Error('Webhook secret is not configured')
  }

  if (!signature) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  try {
    const sigBuf = Buffer.from(signature)
    const secretBuf = Buffer.from(webhookSecret)
    if (sigBuf.length !== secretBuf.length) {
      return false
    }
    return crypto.timingSafeEqual(sigBuf, secretBuf)
  } catch {
    return false
  }
}

// Sanitize content to prevent XSS
function sanitizeContent(content: string): string {
  // Basic sanitization - remove script tags and dangerous attributes
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

export async function POST(request: NextRequest) {
  try {
  // 0. Validate required env vars at runtime (not build time)
  if (!process.env.N8N_BOT_USER_ID) {
    return NextResponse.json(
      { error: 'N8N_BOT_USER_ID is not configured' },
      { status: 500 }
    )
  }

  // 1. Validate Content-Type
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    // 2. Check Content-Length
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }

    // 3. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // 4. CORS validation
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'https://n8n.njooba.com',
      process.env.NEXT_PUBLIC_APP_URL,
    ].filter(Boolean)

    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: 'CORS policy violation' },
        { status: 403 }
      )
    }

    // 5. Get body as text for signature verification
    const bodyText = await request.text()

    // 6. Verify HMAC signature BEFORE parsing
    if (!verifyWebhookSignature(request, bodyText)) {
      // Log failed attempt (but don't log body)
      console.error('Webhook signature verification failed', {
        ip,
        timestamp: new Date().toISOString(),
      })
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // 7. Parse JSON after verification
    const body = JSON.parse(bodyText)

    // 8. Extract workflow type
    const workflowType = request.headers.get('x-workflow-type') || body.workflowType

    // Safe logging - NO sensitive data
    console.log('Webhook received', {
      workflowType,
      itemCount: Array.isArray(body.items) ? body.items.length : 0,
      timestamp: new Date().toISOString(),
    })

    // 9. Handle different workflow types
    switch (workflowType) {
      case 'rss-feed':
        return await handleRSSFeed(body)

      case 'github-trending':
        return await handleGitHubTrending(body)

      case 'devto-sync':
        return await handleDevToSync(body)

      case 'content-post':
        return await handleContentPost(body)

      default:
        return NextResponse.json(
          { error: 'Unknown workflow type' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    // Log error server-side only (sanitized)
    console.error('Webhook processing failed', {
      errorCode: error.code,
      timestamp: new Date().toISOString(),
      // NOT error.message, NOT error.stack
    })

    // Return GENERIC message to client
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Category slug to UUID mapping cache
let categoryCache: Map<string, string> | null = null

async function getCategoryId(categorySlug: string): Promise<string | null> {
  // Load cache if needed
  if (!categoryCache) {
    categoryCache = new Map()
    const { data: categories } = await getSupabaseAdmin()
      .from('categories')
      .select('id, slug, name')

    if (categories) {
      for (const cat of categories) {
        categoryCache.set(cat.slug.toLowerCase(), cat.id)
        categoryCache.set(cat.name.toLowerCase(), cat.id)
      }
    }
  }

  return categoryCache.get(categorySlug.toLowerCase()) || null
}

// Handler for RSS feed aggregation
async function handleRSSFeed(data: any) {
  const { items } = data

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
  }

  let insertedCount = 0

  for (const item of items) {
    try {
      // Validate item
      const validatedItem = RSSItemSchema.parse(item)

      // Sanitize content
      const sanitizedTitle = sanitizeContent(validatedItem.title)
      const sanitizedContent = sanitizeContent(
        validatedItem.content || validatedItem.description || ''
      )

      // Skip if empty after sanitization
      if (!sanitizedTitle || !sanitizedContent) {
        continue
      }

      // Check for duplicates
      const { data: existing } = await getSupabaseAdmin()
        .from('posts')
        .select('id')
        .eq('title', sanitizedTitle)
        .limit(1)

      if (existing && existing.length > 0) {
        continue // Skip duplicates
      }

      // Map category string to UUID
      const categoryId = validatedItem.category
        ? await getCategoryId(validatedItem.category)
        : null

      // Insert post (matching actual schema)
      const { error } = await getSupabaseAdmin().from('posts').insert({
        title: sanitizedTitle,
        content: sanitizedContent,
        type: 'article',
        category_id: categoryId,
        image_url: validatedItem.image_url || null,
        user_id: process.env.N8N_BOT_USER_ID!,
        is_featured: false,
        is_fire: false,
      })

      if (error) {
        console.error('Failed to insert post', {
          errorCode: error.code,
          timestamp: new Date().toISOString(),
        })
        continue
      }

      insertedCount++
    } catch (validationError) {
      // Skip invalid items silently
      continue
    }
  }

  return NextResponse.json({
    success: true,
    inserted: insertedCount,
  })
}

// Handler for GitHub trending
async function handleGitHubTrending(data: any) {
  const { repositories } = data

  if (!Array.isArray(repositories)) {
    return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
  }

  let insertedCount = 0
  const devtoolsCategoryId = await getCategoryId('devtools')

  for (const repo of repositories) {
    try {
      if (!repo.name || !repo.description) continue

      const title = sanitizeContent(`${repo.name} - ${repo.description}`)
      const content = sanitizeContent(`
Trending Repository

**${repo.name}** by ${repo.owner || 'Unknown'}

${repo.description}

Stars: ${repo.stars || 0}
Forks: ${repo.forks || 0}
Language: ${repo.language || 'N/A'}

[View on GitHub](${repo.url})
      `.trim())

      const { error } = await getSupabaseAdmin().from('posts').insert({
        title,
        content,
        type: 'article',
        category_id: devtoolsCategoryId,
        image_url: null,
        user_id: process.env.N8N_BOT_USER_ID!,
        is_featured: (repo.stars || 0) > 1000,
        is_fire: (repo.stars || 0) > 5000,
      })

      if (!error) insertedCount++
    } catch {
      continue
    }
  }

  return NextResponse.json({
    success: true,
    inserted: insertedCount,
  })
}

// Handler for Dev.to sync
async function handleDevToSync(data: any) {
  const { articles } = data

  if (!Array.isArray(articles)) {
    return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
  }

  let insertedCount = 0
  const edtechCategoryId = await getCategoryId('edtech')

  for (const article of articles) {
    try {
      if (!article.title) continue

      // Check if exists
      const { data: existing } = await getSupabaseAdmin()
        .from('posts')
        .select('id')
        .eq('title', article.title)
        .limit(1)

      if (existing && existing.length > 0) continue

      const { error } = await getSupabaseAdmin().from('posts').insert({
        title: sanitizeContent(article.title),
        content: sanitizeContent(
          article.description || article.body_markdown?.substring(0, 500) || ''
        ),
        type: 'article',
        category_id: edtechCategoryId,
        image_url: article.cover_image || null,
        user_id: process.env.N8N_BOT_USER_ID!,
        is_featured: (article.positive_reactions_count || 0) > 50,
        is_fire: (article.positive_reactions_count || 0) > 200,
      })

      if (!error) insertedCount++
    } catch {
      continue
    }
  }

  return NextResponse.json({
    success: true,
    inserted: insertedCount,
  })
}

// Generic content post handler
async function handleContentPost(data: any) {
  try {
    // Validate input
    const validatedData = ContentPostSchema.parse(data)

    // Map category string to UUID
    const categoryId = validatedData.category
      ? await getCategoryId(validatedData.category)
      : null

    const { error } = await getSupabaseAdmin().from('posts').insert({
      title: sanitizeContent(validatedData.title),
      content: sanitizeContent(validatedData.content),
      type: 'post',
      category_id: categoryId,
      image_url: validatedData.image_url || null,
      user_id: process.env.N8N_BOT_USER_ID!,
      is_featured: false,
      is_fire: false,
    })

    if (error) {
      console.error('Post creation failed', {
        errorCode: error.code,
        timestamp: new Date().toISOString(),
      })
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (validationError) {
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'n8n webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
