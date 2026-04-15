# Personal Wiki System with Daily Email Digests

An AI-powered personal knowledge management system that automatically organizes information and delivers daily email summaries.

## 📋 Overview (Non-Technical)

This system acts as your **personal AI assistant for knowledge management**. It:

- **Stores and organizes** documents, papers, and web pages into a structured wiki
- **Automatically generates** wiki pages with summaries and cross-references using AI
- **Sends daily email digests** every morning at 7:00 AM Singapore Time with:
  - 📰 Latest Singapore news from Channel NewsAsia (CNA)
  - 📚 Creative summary of your personal wiki content
- **Runs completely automatically** in the cloud (works even when your computer is off)
- **Zero cost** - uses free AI and email services

### Business Value

✅ **Time Saving**: Automatically processes and summarizes information instead of manual reading  
✅ **Stay Informed**: Daily Singapore news digest ensures you never miss important updates  
✅ **Knowledge Organization**: AI automatically creates structured wiki pages with connections  
✅ **Always Available**: Cloud-based automation runs 24/7 without manual intervention  
✅ **Searchable**: Query your entire knowledge base using natural language

---

## 🎯 Key Features

### 1. **Personal Wiki Management**
- Upload documents (PDF, Markdown, text files)
- Add web pages via URL
- AI automatically extracts concepts and creates wiki pages
- Cross-referenced pages with related concepts
- Tag-based organization

### 2. **Daily Email Digests** 
- **Singapore News Digest**: Top 10 CNA articles with AI summary
- **Wiki Digest**: Creative short story connecting your wiki concepts
- Delivered to: `rnvenkateshwari@gmail.com`
- Schedule: Every day at 7:00 AM SGT
- Works automatically via GitHub Actions (even when laptop is off)

### 3. **AI-Powered Q&A**
- Ask questions about your knowledge base
- AI searches wiki pages and provides cited answers
- Natural language queries

### 4. **Maintenance Dashboard**
- Test email digests manually
- View system health
- Monitor wiki statistics

---

## 🏗️ Technical Architecture

### Technology Stack

**Frontend:**
- React 18.3 with TypeScript
- Tailwind CSS v4 for styling
- Radix UI components
- React Resizable Panels for layout

**Backend:**
- Supabase (PostgreSQL database + Edge Functions)
- Hono web framework (TypeScript/Deno)
- Key-value store for data persistence
- Supabase Storage for file uploads

**AI/ML:**
- **Groq AI** (llama-3.3-70b-versatile) - Free tier
  - Document processing
  - Concept extraction
  - News summarization
  - Q&A responses
  
**Email Service:**
- **Resend** - Free tier (100 emails/day)

**Automation:**
- **GitHub Actions** - Daily workflow scheduling
- Runs at 23:00 UTC (7:00 AM SGT)

### System Flow

```
┌─────────────────┐
│   Upload Files  │
│   or URLs       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Supabase Storage       │
│  + KV Store (metadata)  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Groq AI Processing     │
│  - Extract concepts     │
│  - Generate summaries   │
│  - Create wiki pages    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Wiki Pages Database    │
│  (searchable, linked)   │
└─────────────────────────┘

Daily at 7am SGT:
┌──────────────────┐    ┌──────────────────┐
│  Fetch CNA RSS   │───▶│  Groq AI         │
│  Singapore News  │    │  Summarization   │
└──────────────────┘    └────────┬─────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Resend Email   │
                        │  Service        │
                        └─────────────────┘
```

---

## 📧 Daily Email Automation

### How It Works

1. **GitHub Actions Workflow** (`.github/workflows/daily-digest.yml`) triggers daily at 7:00 AM SGT
2. **Two API endpoints** are called:
   - `/send-news-digest` - Fetches CNA RSS, summarizes with Groq, sends email
   - `/send-daily-digest` - Summarizes wiki pages, sends email
3. **Emails delivered** to rnvenkateshwari@gmail.com
4. **Completely serverless** - runs on GitHub's infrastructure

### Cron Schedule
```yaml
schedule:
  - cron: '0 23 * * *'  # 23:00 UTC = 7:00 AM Singapore Time
```

---

## 🚀 Setup Instructions

### Prerequisites
- Supabase account (free tier)
- Groq API key (free - https://console.groq.com/)
- Resend API key (free - https://resend.com/)
- GitHub account (for automation)

### Environment Variables (Supabase Secrets)

Add these in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```
GROQ_API_KEY=gsk_...
RESEND_API_KEY=re_...
SUPABASE_URL=(auto-configured)
SUPABASE_ANON_KEY=(auto-configured)
SUPABASE_SERVICE_ROLE_KEY=(auto-configured)
SUPABASE_DB_URL=(auto-configured)
```

### Deployment Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/venkateshwari-rn/personal-wiki.git
   cd personal-wiki
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Supabase**
   - Create project at https://supabase.com
   - Add API keys to secrets
   - Deploy edge function from Make settings

4. **Enable GitHub Actions**
   - Push code to GitHub
   - Workflow automatically activates
   - Emails sent daily at 7am SGT

5. **Test Manually**
   - Go to Maintenance tab
   - Click "Send News Digest Now" or "Send Test Email Now"
   - Check inbox

---

## 📖 User Guide

### Uploading Content

1. Click **Upload** button in sidebar
2. Choose file (PDF, Markdown) or enter URL
3. Click **Upload**
4. System automatically processes and creates wiki pages

### Processing Documents

1. Go to **Raw Materials** tab
2. Find pending document
3. Click **Process** button
4. AI extracts concepts and generates wiki pages

### Viewing Wiki Pages

1. Go to **Wiki Pages** tab
2. Browse all generated pages in grid view
3. Click any page to view full content
4. See tags and related concepts

### Asking Questions

1. Go to **Ask Questions** tab
2. Type your question
3. AI searches wiki and provides cited answer

### Testing Email Digests

1. Go to **Maintenance** tab
2. Click **"Send News Digest Now"** for Singapore news
3. Click **"Send Test Email Now"** for wiki digest
4. Check email inbox

---

## 🔧 API Endpoints

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload` | POST | Upload file to storage |
| `/add-url` | POST | Add web page URL |
| `/process/:id` | POST | Process document with AI |
| `/raw-materials` | GET | List all raw materials |
| `/raw-materials/:id` | DELETE | Delete raw material |
| `/wiki-pages` | GET | List all wiki pages |
| `/ask` | POST | Ask question about wiki |
| `/send-daily-digest` | POST | Send wiki digest email |
| `/send-news-digest` | POST | Send CNA news digest email |
| `/fetch-cna-news` | GET | Fetch latest CNA news (JSON) |

### Example API Call

```bash
# Send news digest
curl -X POST https://hyxzpcqihvyrmyozdhid.supabase.co/functions/v1/make-server-defea855/send-news-digest \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

---

## 📊 Project Structure

```
personal-wiki/
├── .github/
│   └── workflows/
│       └── daily-digest.yml          # GitHub Actions automation
├── src/
│   ├── app/
│   │   ├── App.tsx                   # Main application component
│   │   └── components/
│   │       ├── WikiSidebar.tsx       # Navigation sidebar
│   │       ├── WikiListView.tsx      # Wiki pages grid view
│   │       ├── WikiPageView.tsx      # Individual page viewer
│   │       ├── RawMaterialView.tsx   # Raw materials manager
│   │       ├── AskQuestionView.tsx   # Q&A interface
│   │       ├── MaintenanceView.tsx   # Maintenance dashboard
│   │       └── UploadDialog.tsx      # File upload dialog
│   └── styles/
│       └── theme.css                 # Tailwind theme
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx             # Main server logic
│           └── kv_store.tsx          # Database utilities
├── utils/
│   └── supabase/
│       └── info.tsx                  # Supabase config
├── CNA_NEWS_DIGEST.md                # News digest documentation
├── DAILY_DIGEST_SETUP.md             # Email setup guide
├── package.json                      # Dependencies
└── README.md                         # This file
```

---

## 🔐 Security & Privacy

- **API Keys**: Stored securely in Supabase secrets (not in code)
- **Email**: Only sends to verified email address (rnvenkateshwari@gmail.com)
- **Data**: Stored in private Supabase database
- **Authentication**: Bearer token authentication for all API calls
- **CORS**: Configured for secure cross-origin requests

**Note**: This system is designed for personal use, not for collecting PII or sensitive data.

---

## 🎨 Features In Detail

### 1. AI-Powered Document Processing

When you upload a document:
1. File stored in Supabase Storage
2. Content extracted (text from PDF/MD)
3. Groq AI analyzes content and identifies key concepts
4. For each concept:
   - Creates a dedicated wiki page
   - Writes comprehensive explanation
   - Identifies related concepts
   - Adds relevant tags
5. All pages stored in database with cross-references

### 2. Singapore News Digest

**News Source**: Channel NewsAsia (CNA) RSS Feed
- Category: Singapore News
- Frequency: Updates throughout the day
- Articles fetched: Top 10 latest

**Processing**:
1. Fetch RSS feed XML
2. Parse articles (title, description, link, date)
3. Send to Groq AI for summarization
4. AI generates 300-400 word cohesive summary
5. Format as HTML email with article links
6. Send via Resend

**Email Format**:
- Subject: "📰 Daily Singapore News Digest - [Date]"
- Content: AI summary + top 5 article cards
- Theme: Red/orange professional design

### 3. Wiki Knowledge Digest

**Processing**:
1. Fetch all wiki pages from database
2. Extract titles, content, tags
3. Send to Groq AI with creative prompt
4. AI generates 200-300 word creative short story
5. Story weaves together concepts from wiki
6. Format as HTML email
7. Send via Resend

**Email Format**:
- Subject: "Your Daily Wiki Digest - [Date]"
- Content: Creative story + wiki page list
- Theme: Purple/blue professional design

---

## 📈 Future Enhancements

Potential improvements:

- [ ] Add more news sources (Straits Times, TODAY, Business Times)
- [ ] Support for multiple email recipients
- [ ] Wiki page editing interface
- [ ] Export wiki to Markdown/PDF
- [ ] Mobile app
- [ ] Integration with Notion/Obsidian
- [ ] Custom email schedules
- [ ] Analytics dashboard
- [ ] Collaborative features
- [ ] Version history for wiki pages

---

## 🐛 Troubleshooting

### Emails Not Received

**Check:**
1. Spam folder
2. Resend API key configured in Supabase
3. Groq API key configured in Supabase
4. Server deployed (latest code)
5. GitHub Actions workflow enabled
6. Check GitHub Actions logs: https://github.com/venkateshwari-rn/personal-wiki/actions

### Processing Fails

**Common causes:**
1. Groq API key missing or invalid
2. Document too large (>30,000 characters)
3. Network timeout
4. Invalid file format

**Solution:** Check Supabase edge function logs in dashboard

### GitHub Actions Not Running

**Check:**
1. Workflow file pushed to repository
2. Actions enabled in repository settings
3. Workflow syntax is valid YAML
4. Check Actions tab for error messages

---

## 📞 Support

- **Documentation**: See `CNA_NEWS_DIGEST.md` and `DAILY_DIGEST_SETUP.md`
- **GitHub Repository**: https://github.com/venkateshwari-rn/personal-wiki
- **Issues**: Create an issue in the GitHub repository

---

## 📄 License

This is a personal project. All rights reserved.

---

## 🙏 Acknowledgments

**Technologies Used:**
- [Groq](https://groq.com/) - Fast AI inference
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Resend](https://resend.com/) - Email delivery
- [GitHub Actions](https://github.com/features/actions) - Automation
- [React](https://react.dev/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

## 📊 System Statistics

- **AI Model**: Llama 3.3 70B (via Groq)
- **Processing Speed**: ~2-3 seconds per document
- **Email Delivery**: < 1 second
- **Automation Reliability**: 99.9% (GitHub Actions uptime)
- **Cost**: $0/month (all free tiers)

---

**Built with ❤️ for efficient knowledge management**

Last updated: April 15, 2026
