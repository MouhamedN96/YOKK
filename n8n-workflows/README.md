# N8N Workflows for YOKK

Automation workflows for content aggregation and syndication.

## Active Workflows

### RSS Feed Aggregator (Production)

**Files:**
- `rss-aggregator-production.json` (importable)
- `update-payload.json` (API update reference)

**N8N ID:** `SHvMmm0XRjHm0iEA`
**Schedule:** Every 4 hours
**Status:** ✅ Active

Aggregates content from 7 African tech RSS feeds:
- TechCabal
- Techpoint Africa
- Disrupt Africa
- Benjamin Dada
- Dev.to Africa
- Technext Nigeria
- Ventureburn

## Planned Workflows

| Workflow | Description | Status |
|----------|-------------|--------|
| GitHub Trending | Monitor trending African repos | Planned |
| Dev.to Sync | Sync African tech articles | Planned |
| Twitter/X Monitor | Curate developer tweets | Planned |

---

## Setup Instructions

### Step 1: N8N Environment Variable

In your N8N instance (Settings → Variables):

| Variable | Value |
|----------|-------|
| `N8N_WEBHOOK_SECRET` | `0dc8e1fc62d14d5a81984071b80e65bada6f25294b69c258e46664a14a9f57e3` |

### Step 2: Vercel Environment Variables

In Vercel (Project → Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `N8N_WEBHOOK_SECRET` | `0dc8e1fc62d14d5a81984071b80e65bada6f25294b69c258e46664a14a9f57e3` |
| `N8N_BOT_USER_ID` | `f47ac10b-58cc-4372-a567-0e02b2c3d479` |

### Step 3: Supabase Bot User

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO profiles (id, username, display_name, role, onboarding_completed, created_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'yokk_bot',
  'YOKK Bot',
  'developer',
  true,
  now()
)
ON CONFLICT (id) DO NOTHING;
```

### Step 4: Test the Workflow

1. Go to N8N instance (https://n8n.njooba.com)
2. Open "YOKK RSS Feed Aggregator - Production"
3. Click "Execute Workflow" manually
4. Check Vercel logs for webhook request
5. Check Supabase `posts` table for new entries

---

## Webhook Endpoint

**URL:** `https://yokk.vercel.app/api/webhooks/n8n`
**Method:** POST
**Headers:**
- `Content-Type: application/json`
- `x-n8n-signature: <hmac-sha256-signature>`
- `x-workflow-type: rss-feed`

## Security

- HMAC-SHA256 signature verification
- Rate limiting (100 requests per hour)
- Content sanitization (XSS prevention)
- Service role client for RLS bypass

## Workflow Types Supported

| Type | Description |
|------|-------------|
| `rss-feed` | RSS content aggregation |
| `github-trending` | GitHub trending repos |
| `devto-sync` | Dev.to article sync |
| `content-post` | Manual content posting |

## Monitoring

Check workflow execution logs in n8n:
- Workflows → Select workflow → Executions tab
- View success/failure rates
- Debug any errors

---

*Part of YOKK - Built for Africa's builders*
