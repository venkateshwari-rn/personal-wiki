# Daily Wiki Digest Email Setup

Your wiki system now sends daily digest emails powered by Groq AI to **rnvenkateshwari@gmail.com**.

## What it does

- Fetches all wiki pages from your knowledge base
- Uses Groq AI (llama-3.3-70b-versatile) to generate a creative short story (200-300 words) that weaves together the key concepts
- Sends a beautifully formatted email via Resend
- Runs daily at 7:00 AM Singapore Time (SGT)

## Testing

You can test the email immediately from the **Maintenance** tab in your wiki app:
1. Go to the Maintenance tab
2. Click "Send Test Email Now"
3. Check your inbox at rnvenkateshwari@gmail.com

## Sending to Other Email Addresses

Currently, emails are sent to **rnvenkateshwari@gmail.com** (your Resend account email). 

**To send to other addresses like venka_navaneetham@tech.gov.sg:**

1. Go to https://resend.com/domains
2. Add and verify your domain (e.g., yourdomain.com)
3. Update the server code in `/supabase/functions/server/index.tsx`:
   - Change `from: "Personal Wiki <onboarding@resend.dev>"` to `from: "Personal Wiki <noreply@yourdomain.com>"`
   - Change `to: ["rnvenkateshwari@gmail.com"]` to `to: ["venka_navaneetham@tech.gov.sg"]`
4. Redeploy your Supabase edge function

**Why this is required:** Resend requires domain verification to prevent spam and ensure email deliverability. Without a verified domain, you can only send to your own email address.

## Setting up automated daily emails at 7 AM SGT

To automate the daily digest at 7:00 AM SGT (which is 23:00 UTC the previous day), you have several options:

### Option 1: GitHub Actions (Recommended)

1. Create `.github/workflows/daily-digest.yml` in your repository:

```yaml
name: Daily Wiki Digest

on:
  schedule:
    # Runs at 23:00 UTC (7:00 AM SGT next day)
    - cron: '0 23 * * *'
  workflow_dispatch: # Allows manual trigger

jobs:
  send-digest:
    runs-on: ubuntu-latest
    steps:
      - name: Send Daily Digest Email
        run: |
          curl -X POST \
            https://hyxzpcqihvyrmyozdhid.supabase.co/functions/v1/make-server-defea855/send-daily-digest \
            -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eHpwY3FpaHZ5cm15b3pkaGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTUxODQsImV4cCI6MjA5MTgzMTE4NH0.91hbSVDCFyT8sdpjJFZUfwqmvNqU1vthXFH7-wlbn5E" \
            -H "Content-Type: application/json"
```

2. Commit and push this file to your repository
3. GitHub will automatically run this workflow daily at 7 AM SGT

### Option 2: Supabase pg_cron

If you have Supabase Pro plan, you can use pg_cron:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the daily digest (23:00 UTC = 7:00 AM SGT)
SELECT cron.schedule(
  'daily-wiki-digest',
  '0 23 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://hyxzpcqihvyrmyozdhid.supabase.co/functions/v1/make-server-defea855/send-daily-digest',
      headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eHpwY3FpaHZ5cm15b3pkaGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTUxODQsImV4cCI6MjA5MTgzMTE4NH0.91hbSVDCFyT8sdpjJFZUfwqmvNqU1vthXFH7-wlbn5E", "Content-Type": "application/json"}'::jsonb
    ) AS request_id;
  $$
);
```

Run this in your Supabase SQL editor.

### Option 3: External Cron Service

Use a free service like [cron-job.org](https://cron-job.org):

1. Sign up at https://cron-job.org
2. Create a new cron job with:
   - **URL**: `https://hyxzpcqihvyrmyozdhid.supabase.co/functions/v1/make-server-defea855/send-daily-digest`
   - **Schedule**: Daily at 23:00 UTC
   - **Request Method**: POST
   - **Headers**: 
     - `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eHpwY3FpaHZ5cm15b3pkaGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTUxODQsImV4cCI6MjA5MTgzMTE4NH0.91hbSVDCFyT8sdpjJFZUfwqmvNqU1vthXFH7-wlbn5E`
     - `Content-Type: application/json`

### Option 4: Your Own Server

If you have a server with cron access, add this to your crontab:

```bash
# Run daily at 7:00 AM SGT (23:00 UTC)
0 23 * * * curl -X POST https://hyxzpcqihvyrmyozdhid.supabase.co/functions/v1/make-server-defea855/send-daily-digest -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eHpwY3FpaHZ5cm15b3pkaGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTUxODQsImV4cCI6MjA5MTgzMTE4NH0.91hbSVDCFyT8sdpjJFZUfwqmvNqU1vthXFH7-wlbn5E" -H "Content-Type: application/json"
```

## Email Configuration

The digest email includes:
- A creative short story that weaves together concepts from your wiki pages
- List of wiki pages that were summarized
- Professional formatting with your wiki branding

### Customizing the "From" email address

By default, Resend uses `onboarding@resend.dev`. To use your own domain:

1. Go to https://resend.com/domains
2. Add and verify your domain
3. Update the server code to use your verified email (e.g., `wiki@yourdomain.com`)

## Troubleshooting

**Email not received?**
- Check spam folder
- Verify RESEND_API_KEY is configured in Supabase secrets
- Verify GROQ_API_KEY is configured in Supabase secrets
- Test manually from the Maintenance tab to see error messages
- Check Supabase edge function logs

**Want to change the email content?**
- Edit `/supabase/functions/server/index.tsx`
- Modify the prompt or HTML template in the `/send-daily-digest` endpoint
- Redeploy your Supabase edge function

**Want to change the recipient?**
- Edit the `to` field in `/supabase/functions/server/index.tsx`
- Redeploy your Supabase edge function
