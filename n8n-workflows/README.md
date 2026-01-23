# n8n Workflows for NJOOBA Platform

## Overview
This directory contains n8n workflow definitions for automating content aggregation and feed management for the NJOOBA platform.

## Workflows

### 1. **RSS Feed Aggregator** (`rss-aggregator.json`)
- Fetches developer content from multiple RSS feeds
- Filters relevant African tech content
- Enriches with metadata (tags, categories)
- Posts to Supabase

### 2. **GitHub Trending Monitor** (`github-trending.json`)
- Monitors GitHub trending repositories
- Filters by African developers or African tech topics
- Creates posts in NJOOBA feed

### 3. **Dev.to Content Sync** (`devto-sync.json`)
- Syncs articles from Dev.to with African tech tags
- Deduplicates existing content
- Auto-categorizes posts

### 4. **Twitter/X Developer News** (`twitter-monitor.json`)
- Monitors developer-focused Twitter accounts
- Filters quality content
- Creates curated posts

## Setup Instructions

### Prerequisites
- n8n instance running at https://n8n.njooba.com
- Supabase credentials configured
- API keys for external services (GitHub, Dev.to, etc.)

### Installation

1. **Access n8n dashboard:** https://n8n.njooba.com
2. **Import workflows:**
   - Click "Workflows" → "Import from File"
   - Select workflow JSON files from this directory
3. **Configure credentials** for each workflow (see below)
4. **Activate workflows** using the toggle switch

## Required Credentials in n8n

### Supabase
- **Credential Type:** HTTP Header Auth
- **Name:** `Authorization`
- **Value:** `Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY`
- **URL:** `https://lyhfeqejktubykgjzjtj.supabase.co/rest/v1`

### GitHub (Optional)
- **Credential Type:** GitHub API
- **Access Token:** Generate from https://github.com/settings/tokens

### Dev.to (Optional)
- **Credential Type:** Header Auth
- **API Key:** Get from https://dev.to/settings/extensions

## Testing Workflows

Once credentials are set up, you can test by:
1. Click "Execute Workflow" button in n8n
2. Check Supabase `posts` table for new entries
3. Verify posts appear in NJOOBA feed at http://localhost:3001

## Monitoring

Check workflow execution logs in n8n:
- Workflows → Select workflow → Executions tab
- View success/failure rates
- Debug any errors
