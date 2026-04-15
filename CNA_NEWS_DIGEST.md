# Daily Singapore News Digest from CNA

Your system now fetches the latest Singapore news from **Channel NewsAsia (CNA)** RSS feeds, summarizes them with Groq AI, and emails you daily!

## What You Get

Every day at **7:00 AM SGT**, you'll receive an email with:

📰 **AI-Generated Summary** - Groq AI reads the top 10 CNA Singapore news articles and creates a comprehensive 300-400 word summary highlighting key stories

📌 **Top 5 Articles** - Full headlines, descriptions, links, and publication dates for the most important stories

🎨 **Beautiful Formatting** - Professional red/orange themed email design

## News Source

**Channel NewsAsia (CNA)** - Singapore News
- One of Singapore's leading news sources
- Covers local news, politics, economy, society
- Updates throughout the day

## How It Works

1. **RSS Feed Fetching**: Server fetches latest 10 articles from CNA Singapore RSS feed
2. **AI Summarization**: Groq AI (llama-3.3-70b) analyzes articles and creates a cohesive summary
3. **Email Delivery**: Resend sends a beautifully formatted email to rnvenkateshwari@gmail.com
4. **Automation**: GitHub Actions runs daily at 7am SGT (even when your laptop is off!)

## Testing Manually

You can test the news digest anytime from the **Maintenance** tab:

1. Go to your Personal Wiki app
2. Click the **Maintenance** tab
3. Find the "Daily Singapore News Digest" section
4. Click **"Send News Digest Now"**
5. Check your email at rnvenkateshwari@gmail.com

## Automated Daily Delivery

Already set up! Your GitHub Actions workflow sends both:
- 📰 CNA Singapore News Digest
- 📚 Personal Wiki Digest

Every morning at **7:00 AM SGT**

View/trigger at: https://github.com/venkateshwari-rn/personal-wiki/actions

## Email Details

- **From**: Singapore News <onboarding@resend.dev>
- **To**: rnvenkateshwari@gmail.com
- **Subject**: 📰 Daily Singapore News Digest - [Date]
- **Frequency**: Daily at 7:00 AM SGT

## Customization Options

### Change News Categories

To add more CNA news categories, edit `/supabase/functions/server/index.tsx`:

```typescript
const rssFeeds = [
  "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6511", // Singapore
  // Add more RSS feeds:
  // "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10416", // Business
  // "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6935", // Asia
];
```

### Change Number of Articles

Currently fetches top 10 articles. To change:

```typescript
for (const item of items.slice(0, 10)) { // Change 10 to desired number
```

### Modify Summary Style

Change the Groq AI prompt to adjust summary style (formal, casual, bullet points, etc.):

```typescript
const prompt = `You are a news summarizer. Based on the following Singapore news articles...`;
```

## Troubleshooting

**No email received?**
- Check spam folder
- Verify GROQ_API_KEY is configured
- Verify RESEND_API_KEY is configured
- Check Supabase edge function logs
- Test manually from Maintenance tab

**RSS feed not working?**
- CNA might have changed their RSS feed URLs
- Check https://www.channelnewsasia.com/ for updated RSS links
- Server logs will show RSS parsing errors

**Want different news sources?**
- Find RSS feeds from other Singapore news sites (TODAY, Straits Times, etc.)
- Add them to the `rssFeeds` array in the server code

## Benefits

✅ **Stay Informed** - Never miss important Singapore news
✅ **Save Time** - AI summarizes so you don't need to read every article
✅ **Automated** - Runs daily without any manual work
✅ **Free** - Uses free Groq AI and Resend tiers
✅ **Always On** - Works even when your laptop is shutdown

Enjoy your daily news digest! 📰☕
