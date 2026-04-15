# How to Deploy Backend Changes

## Current Issue
The backend is still using the OLD code with Anthropic. You need to deploy the NEW code with Groq (free API).

## Steps to Fix:

### 1. Get Free Groq API Key
- Go to: https://console.groq.com/
- Sign up (no credit card needed)
- Click **API Keys** in sidebar
- Click **Create API Key**
- Copy the key (starts with `gsk_...`)

### 2. Add Key to Supabase
- Go to: https://supabase.com/dashboard/project/hyxzpcqihvyrmyozdhid
- Click **Project Settings** (gear icon at bottom left)
- Click **Edge Functions**
- Scroll down to **Secrets** section
- Click **Add new secret**
  - Name: `GROQ_API_KEY`
  - Value: (paste your Groq API key)
- Click **Save**

### 3. Deploy in Make Settings
- Go to **Make settings** page in Figma
- Click **Supabase** in sidebar
- Click the **Deploy** button
- Wait for "Deployment successful" message

### 4. Test
- Refresh your Make app
- Try uploading a document
- Error should be gone!

## Why This Fixes It
- Old backend: Uses Anthropic (no credits = error)
- New backend: Uses Groq (free, no credits needed)
- Deploying updates the running code from old to new
