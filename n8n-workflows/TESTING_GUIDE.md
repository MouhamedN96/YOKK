# n8n + NJOOBA Integration Testing Guide

## Step-by-Step Setup & Testing

### 1. Get Required Credentials

#### A. Supabase Service Role Key
1. Go to https://supabase.com/dashboard/project/lyhfeqejktubykgjzjtj/settings/api
2. Scroll down to "Project API keys"
3. Copy the **`service_role`** key (⚠️ Keep this secret!)
4. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...YOUR_KEY_HERE
   ```

#### B. n8n API Key
1. Go to https://n8n.njooba.com
2. Click your avatar → **Settings**
3. Navigate to **API** tab
4. Click **"Create API Key"**
   - Name: `claude-code-automation`
5. Copy the key (starts with `n8n_api_...`)
6. Add to `.env.local`:
   ```
   N8N_API_KEY=n8n_api_...YOUR_KEY_HERE
   ```

#### C. n8n Webhook Secret (Security)
1. Generate a random secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Add to `.env.local`:
   ```
   N8N_WEBHOOK_SECRET=your_random_secret_here
   ```

#### D. Create Bot User in Supabase (Optional)
For automated posts, create a bot user:
1. Sign up a bot account in your app
2. Get the user ID from Supabase dashboard
3. Add to `.env.local`:
   ```
   N8N_BOT_USER_ID=user-uuid-here
   ```

### 2. Import Workflows into n8n

1. **Go to n8n:** https://n8n.njooba.com

2. **Import Test Workflow First:**
   - Click **"Workflows"** → **"Add Workflow"** → **"Import from File"**
   - Select: `n8n-workflows/test-supabase-connection.json`
   - Click **"Import"**

3. **Configure Credentials:**
   - Click on the **"Create Test Post in Supabase"** node
   - Under "Credentials", click **"+ Create New"**
   - Select **"HTTP Header Auth"**
   - Fill in:
     - **Name:** `Supabase Service Role`
     - **Header Name:** `Authorization`
     - **Header Value:** `Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY`
     - **Additional Headers (optional):**
       - Name: `apikey`
       - Value: `YOUR_SUPABASE_SERVICE_ROLE_KEY`
   - Click **"Save"**

4. **Test the Workflow:**
   - Click **"Execute Workflow"** button (top right)
   - Wait for execution to complete
   - Check the output - should see "✅ SUCCESS"

5. **Verify in Supabase:**
   - Go to https://supabase.com/dashboard/project/lyhfeqejktubykgjzjtj/editor
   - Open `posts` table
   - You should see the test post!

### 3. Import RSS Feed Aggregator

1. **Import workflow:**
   - Workflows → Add Workflow → Import from File
   - Select: `n8n-workflows/rss-feed-aggregator.json`

2. **Update Webhook URL:**
   - Click on "Send to NJOOBA Webhook" node
   - Change URL from `http://localhost:3000` to `http://localhost:3001`
   - (Or use your production URL once deployed)

3. **Test Manually:**
   - Click "Execute Workflow"
   - Watch the execution flow
   - Check Supabase for new posts

4. **Activate for Scheduled Runs:**
   - Toggle "Active" switch (top right)
   - Workflow will now run every 6 hours automatically

### 4. Test Webhook Endpoint

#### A. Start Your Dev Server
```bash
cd C:\Users\momo-\OneDrive\Desktop\NJOOBA_PS\ui-protoypes
pnpm dev
```

#### B. Test Health Check
Open browser or use curl:
```bash
curl http://localhost:3001/api/webhooks/n8n
```

Expected response:
```json
{
  "status": "ok",
  "message": "n8n webhook endpoint is active",
  "timestamp": "2025-11-26T03:45:00.000Z"
}
```

#### C. Test POST from n8n
In n8n, create a simple test workflow:
- Trigger: Manual
- HTTP Request node:
  - Method: POST
  - URL: `http://localhost:3001/api/webhooks/n8n`
  - Headers:
    - `Content-Type`: `application/json`
    - `x-workflow-type`: `content-post`
  - Body:
    ```json
    {
      "title": "Test from n8n",
      "content": "This is a test post from n8n workflow",
      "category": "general",
      "tags": ["test", "n8n"]
    }
    ```

### 5. Verify End-to-End

1. **Execute the RSS workflow in n8n**
2. **Check server logs** for webhook received
3. **Check Supabase** `posts` table for new entries
4. **Open NJOOBA app** at http://localhost:3001
5. **Verify posts appear** in the feed

### 6. Production Deployment

Once testing is complete:

1. **Update webhook URLs** in n8n workflows:
   - Change `localhost:3001` to your production domain
   - Example: `https://njooba.com/api/webhooks/n8n`

2. **Add webhook secret verification:**
   - In n8n, add header: `x-n8n-signature: YOUR_WEBHOOK_SECRET`

3. **Deploy to production:**
   - Push code to GitHub
   - Deploy via Vercel/Netlify/etc.

## Troubleshooting

### Issue: Webhook returns 401 Unauthorized
**Solution:** Check `N8N_WEBHOOK_SECRET` matches in both n8n and `.env.local`

### Issue: Posts not appearing in Supabase
**Solution:**
- Check RLS policies allow service role to insert
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check `author_id` exists in `profiles` table

### Issue: n8n can't reach webhook
**Solution:**
- For local testing, use ngrok: `ngrok http 3001`
- Update webhook URL in n8n to ngrok URL

### Issue: Duplicate posts
**Solution:** The RSS aggregator already has deduplication logic in the webhook handler

## Next Steps

1. ✅ Import and test basic workflow
2. ✅ Set up RSS aggregator
3. 🔄 Add more content sources (GitHub, Dev.to, Twitter)
4. 🔄 Create moderation workflow (auto-flag inappropriate content)
5. 🔄 Add analytics tracking (views, engagement)
6. 🔄 Set up error notifications (email/Slack on workflow failure)

## Security Checklist

- [ ] Supabase Service Role Key is in `.env.local` (never committed)
- [ ] n8n webhook has signature verification enabled
- [ ] RLS policies prevent unauthorized access
- [ ] Bot user has limited permissions
- [ ] Webhook endpoint rate-limited (TODO: add rate limiting)
