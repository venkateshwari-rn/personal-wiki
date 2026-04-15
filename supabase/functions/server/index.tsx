import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Use Groq (free API) instead of Anthropic
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Resend for daily digest emails
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Helper to check if API is configured
const checkAPIKey = () => {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured. Get free key at https://console.groq.com/ and add to Supabase secrets.");
  }
};

// Initialize Supabase client for storage
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize storage bucket on startup
const BUCKET_NAME = "make-defea855-uploads";
const initStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: false });
      console.log(`Created bucket: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.error("Storage initialization error:", error);
  }
};
initStorage();

// Health check endpoint
app.get("/make-server-defea855/health", (c) => {
  return c.json({ status: "ok" });
});

// Upload file endpoint
app.post("/make-server-defea855/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    const fileId = crypto.randomUUID();
    const fileName = `${fileId}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return c.json({ error: `Upload failed: ${uploadError.message}` }, 500);
    }

    // Store metadata in KV
    const metadata = {
      id: fileId,
      name: file.name,
      type: file.type.includes('pdf') ? 'pdf' : 'markdown',
      fileName: fileName,
      addedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      size: file.size,
    };

    await kv.set(`raw:${fileId}`, metadata);

    return c.json({
      success: true,
      fileId,
      message: "File uploaded successfully. Processing will begin shortly."
    });
  } catch (error) {
    console.error("Upload endpoint error:", error);
    return c.json({ error: `Upload failed: ${error.message}` }, 500);
  }
});

// Add URL endpoint
app.post("/make-server-defea855/add-url", async (c) => {
  try {
    const { url } = await c.req.json();

    if (!url) {
      return c.json({ error: "No URL provided" }, 400);
    }

    const urlId = crypto.randomUUID();
    const metadata = {
      id: urlId,
      name: new URL(url).hostname,
      type: 'web',
      url: url,
      addedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    await kv.set(`raw:${urlId}`, metadata);

    return c.json({
      success: true,
      urlId,
      message: "URL added successfully. Processing will begin shortly."
    });
  } catch (error) {
    console.error("Add URL endpoint error:", error);
    return c.json({ error: `Failed to add URL: ${error.message}` }, 500);
  }
});

// Process document endpoint
app.post("/make-server-defea855/process/:id", async (c) => {
  try {
    checkAPIKey();

    const id = c.req.param("id");
    const metadata = await kv.get(`raw:${id}`);

    if (!metadata) {
      return c.json({ error: "Document not found" }, 404);
    }

    // Update status to processing
    metadata.status = 'processing';
    await kv.set(`raw:${id}`, metadata);

    let content = "";

    // Get document content
    if (metadata.fileName) {
      // Download from storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(metadata.fileName);

      if (error) {
        throw new Error(`Download failed: ${error.message}`);
      }

      content = await data.text();
    } else if (metadata.url) {
      // Fetch from URL
      const response = await fetch(metadata.url);
      content = await response.text();
    }

    // Extract concepts and generate wiki pages using Groq (free API)
    const prompt = `Analyze this document and extract key concepts. For each concept, create a wiki page with:
- A clear title
- Comprehensive explanation
- Related concepts (as [[Wiki Links]])
- Tags for categorization

Document content:
${content.substring(0, 30000)}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "concepts": [
    {
      "title": "Concept Name",
      "content": "# Concept Name\\n\\nDetailed markdown content...",
      "tags": ["tag1", "tag2"],
      "relatedConcepts": ["Other Concept"]
    }
  ]
}`;

    let result;
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Groq API error:", errorData);
        throw new Error(`Groq API failed: ${errorData}`);
      }

      const data = await response.json();
      const responseText = data.choices[0].message.content;

      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(jsonText);
    } catch (apiError) {
      console.error("LLM API error:", apiError);

      // Update status to failed
      metadata.status = 'pending';
      await kv.set(`raw:${id}`, metadata);

      return c.json({
        error: `Processing failed: ${apiError.message || 'Unknown error'}`
      }, 500);
    }

    // Store wiki pages
    for (const concept of result.concepts) {
      const wikiId = crypto.randomUUID();
      await kv.set(`wiki:${wikiId}`, {
        id: wikiId,
        title: concept.title,
        content: concept.content,
        tags: concept.tags,
        relatedConcepts: concept.relatedConcepts,
        sourceId: id,
        lastUpdated: new Date().toISOString().split('T')[0],
      });
    }

    // Update metadata
    metadata.status = 'processed';
    metadata.extractedConcepts = result.concepts.length;
    await kv.set(`raw:${id}`, metadata);

    return c.json({
      success: true,
      conceptsExtracted: result.concepts.length,
      concepts: result.concepts.map(c => c.title)
    });
  } catch (error) {
    console.error("Process document error:", error);
    return c.json({ error: `Processing failed: ${error.message}` }, 500);
  }
});

// Get all raw materials
app.get("/make-server-defea855/raw-materials", async (c) => {
  try {
    const materials = await kv.getByPrefix("raw:");
    return c.json({ materials });
  } catch (error) {
    console.error("Get raw materials error:", error);
    return c.json({ error: `Failed to get materials: ${error.message}` }, 500);
  }
});

// Delete raw material
app.delete("/make-server-defea855/raw-materials/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const metadata = await kv.get(`raw:${id}`);

    if (!metadata) {
      return c.json({ error: "Material not found" }, 404);
    }

    // Delete file from storage if it exists
    if (metadata.fileName) {
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([metadata.fileName]);

      if (deleteError) {
        console.error("Storage delete error:", deleteError);
      }
    }

    // Delete metadata from KV
    await kv.del(`raw:${id}`);

    return c.json({ success: true, message: "Material deleted successfully" });
  } catch (error) {
    console.error("Delete material error:", error);
    return c.json({ error: `Failed to delete material: ${error.message}` }, 500);
  }
});

// Get all wiki pages
app.get("/make-server-defea855/wiki-pages", async (c) => {
  try {
    const pages = await kv.getByPrefix("wiki:");
    return c.json({ pages });
  } catch (error) {
    console.error("Get wiki pages error:", error);
    return c.json({ error: `Failed to get pages: ${error.message}` }, 500);
  }
});

// Ask question endpoint
app.post("/make-server-defea855/ask", async (c) => {
  try {
    checkAPIKey();

    const { question } = await c.req.json();

    if (!question) {
      return c.json({ error: "No question provided" }, 400);
    }

    // Get all wiki pages for context
    const wikiPages = await kv.getByPrefix("wiki:");

    const wikiContext = wikiPages.map(page =>
      `# ${page.title}\n${page.content}\n---`
    ).join('\n\n');

    // Ask question using Groq (free API)
    const prompt = `You are a helpful assistant that answers questions based on a personal wiki knowledge base.

Wiki contents:
${wikiContext.substring(0, 80000)}

User question: ${question}

Answer the question based on the wiki content. Cite which wiki pages you used as sources. If the wiki doesn't contain relevant information, say so.`;

    let answer;
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Groq API error:", errorData);
        throw new Error(`Groq API failed: ${errorData}`);
      }

      const data = await response.json();
      answer = data.choices[0].message.content;
    } catch (apiError) {
      console.error("LLM API error during Q&A:", apiError);

      return c.json({
        error: `Question answering failed: ${apiError.message || 'Unknown error'}`
      }, 500);
    }

    return c.json({
      success: true,
      answer,
      question
    });
  } catch (error) {
    console.error("Ask question error:", error);
    return c.json({ error: `Question answering failed: ${error.message}` }, 500);
  }
});

// Send daily digest email
app.post("/make-server-defea855/send-daily-digest", async (c) => {
  try {
    if (!GROQ_API_KEY) {
      return c.json({ error: "GROQ_API_KEY not configured in Supabase secrets" }, 500);
    }
    if (!RESEND_API_KEY) {
      return c.json({ error: "RESEND_API_KEY not configured in Supabase secrets" }, 500);
    }

    // Get all wiki pages
    const wikiPages = await kv.getByPrefix("wiki:");

    if (wikiPages.length === 0) {
      return c.json({ error: "No wiki pages found to summarize" }, 400);
    }

    // Prepare wiki content for summarization
    const wikiContext = wikiPages.map(page =>
      `**${page.title}**\n${page.content.substring(0, 1000)}\nTags: ${page.tags?.join(', ') || 'None'}\n---`
    ).join('\n\n');

    // Generate short story summary using Groq (free API)
    const prompt = `You are a creative storyteller. Based on the following wiki pages from a personal knowledge base, write a compelling short story (200-300 words) that weaves together the key concepts and ideas. Make it engaging, narrative-driven, and insightful.

Wiki Pages:
${wikiContext.substring(0, 15000)}

Write a short story that connects these concepts in an interesting way.`;

    let summary;
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Groq API error:", errorData);
        throw new Error(`Groq API failed: ${errorData}`);
      }

      const data = await response.json();
      summary = data.choices[0].message.content;
    } catch (apiError) {
      console.error("Groq API error during summarization:", apiError);
      return c.json({
        error: `Failed to generate summary: ${apiError.message || 'Unknown error'}`
      }, 500);
    }

    // Send email via Resend
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    try {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Personal Wiki <onboarding@resend.dev>",
          to: ["rnvenkateshwari@gmail.com"],
          subject: `Your Daily Wiki Digest - ${currentDate}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                📚 Daily Wiki Digest
              </h1>
              <p style="color: #666; font-size: 14px;">${currentDate}</p>

              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #1f2937; margin-top: 0;">Today's Story</h2>
                <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${summary}</p>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px;">
                  This digest was generated from ${wikiPages.length} wiki page${wikiPages.length !== 1 ? 's' : ''} in your personal knowledge base.
                </p>
                <p style="color: #9ca3af; font-size: 12px;">
                  <strong>Wiki pages included:</strong> ${wikiPages.slice(0, 5).map(p => p.title).join(', ')}${wikiPages.length > 5 ? `, and ${wikiPages.length - 5} more...` : ''}
                </p>
              </div>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error("Resend API error:", errorData);
        throw new Error(`Email sending failed: ${errorData}`);
      }

      const emailData = await emailResponse.json();
      console.log("Email sent successfully:", emailData);

      return c.json({
        success: true,
        message: "Daily digest email sent successfully",
        summary,
        emailId: emailData.id,
        wikiPagesCount: wikiPages.length
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return c.json({
        error: `Failed to send email: ${emailError.message || 'Unknown error'}`
      }, 500);
    }
  } catch (error) {
    console.error("Send daily digest error:", error);
    return c.json({ error: `Failed to send digest: ${error.message}` }, 500);
  }
});

// Fetch CNA RSS feed and parse articles
app.get("/make-server-defea855/fetch-cna-news", async (c) => {
  try {
    // CNA RSS feed URLs
    const rssFeeds = [
      "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6511", // Singapore news
    ];

    const allArticles = [];

    for (const feedUrl of rssFeeds) {
      try {
        const response = await fetch(feedUrl);
        const xmlText = await response.text();

        // Parse XML manually (simple parsing for RSS)
        const itemRegex = /<item>(.*?)<\/item>/gs;
        const items = [...xmlText.matchAll(itemRegex)];

        for (const item of items.slice(0, 10)) { // Get top 10 articles
          const itemContent = item[1];

          const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s) ||
                           itemContent.match(/<title>(.*?)<\/title>/s);
          const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s) ||
                          itemContent.match(/<description>(.*?)<\/description>/s);
          const linkMatch = itemContent.match(/<link>(.*?)<\/link>/s);
          const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/s);

          if (titleMatch && descMatch) {
            allArticles.push({
              title: titleMatch[1].trim(),
              description: descMatch[1].replace(/<[^>]*>/g, '').trim(), // Strip HTML tags
              link: linkMatch ? linkMatch[1].trim() : '',
              pubDate: pubDateMatch ? pubDateMatch[1].trim() : '',
            });
          }
        }
      } catch (feedError) {
        console.error(`Error fetching feed ${feedUrl}:`, feedError);
      }
    }

    return c.json({
      success: true,
      articles: allArticles,
      count: allArticles.length
    });
  } catch (error) {
    console.error("Fetch CNA news error:", error);
    return c.json({ error: `Failed to fetch news: ${error.message}` }, 500);
  }
});

// Send daily CNA news digest email
app.post("/make-server-defea855/send-news-digest", async (c) => {
  try {
    if (!GROQ_API_KEY) {
      return c.json({ error: "GROQ_API_KEY not configured in Supabase secrets" }, 500);
    }
    if (!RESEND_API_KEY) {
      return c.json({ error: "RESEND_API_KEY not configured in Supabase secrets" }, 500);
    }

    // Fetch latest CNA news
    const rssFeeds = [
      "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6511", // Singapore news
    ];

    const allArticles = [];

    for (const feedUrl of rssFeeds) {
      try {
        const response = await fetch(feedUrl);
        const xmlText = await response.text();

        // Parse XML manually (simple parsing for RSS)
        const itemRegex = /<item>(.*?)<\/item>/gs;
        const items = [...xmlText.matchAll(itemRegex)];

        for (const item of items.slice(0, 10)) { // Get top 10 articles
          const itemContent = item[1];

          const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s) ||
                           itemContent.match(/<title>(.*?)<\/title>/s);
          const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s) ||
                          itemContent.match(/<description>(.*?)<\/description>/s);
          const linkMatch = itemContent.match(/<link>(.*?)<\/link>/s);
          const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/s);

          if (titleMatch && descMatch) {
            allArticles.push({
              title: titleMatch[1].trim(),
              description: descMatch[1].replace(/<[^>]*>/g, '').trim(),
              link: linkMatch ? linkMatch[1].trim() : '',
              pubDate: pubDateMatch ? pubDateMatch[1].trim() : '',
            });
          }
        }
      } catch (feedError) {
        console.error(`Error fetching feed ${feedUrl}:`, feedError);
      }
    }

    if (allArticles.length === 0) {
      return c.json({ error: "No news articles found" }, 400);
    }

    // Prepare news content for summarization
    const newsContext = allArticles.map((article, idx) =>
      `${idx + 1}. **${article.title}**\n${article.description}\nPublished: ${article.pubDate}\n---`
    ).join('\n\n');

    // Generate summary using Groq
    const prompt = `You are a news summarizer. Based on the following Singapore news articles from Channel NewsAsia, write a concise daily news digest (300-400 words) that highlights the key stories and their significance. Make it informative and well-structured.

Today's Singapore News:
${newsContext.substring(0, 15000)}

Write a comprehensive daily news summary that covers the main stories.`;

    let summary;
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Groq API error:", errorData);
        throw new Error(`Groq API failed: ${errorData}`);
      }

      const data = await response.json();
      summary = data.choices[0].message.content;
    } catch (apiError) {
      console.error("Groq API error during news summarization:", apiError);
      return c.json({
        error: `Failed to generate summary: ${apiError.message || 'Unknown error'}`
      }, 500);
    }

    // Send email via Resend
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Build articles HTML
    const articlesHtml = allArticles.slice(0, 5).map((article, idx) => `
      <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 5px 0; font-size: 16px;">
          <a href="${article.link}" style="color: #2563eb; text-decoration: none;">${idx + 1}. ${article.title}</a>
        </h3>
        <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${article.description.substring(0, 200)}...</p>
        <p style="margin: 5px 0; color: #9ca3af; font-size: 12px;">${article.pubDate}</p>
      </div>
    `).join('');

    try {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Singapore News <onboarding@resend.dev>",
          to: ["rnvenkateshwari@gmail.com"],
          subject: `📰 Daily Singapore News Digest - ${currentDate}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">
                  📰 Daily Singapore News
                </h1>
                <p style="color: #fecaca; margin: 5px 0 0 0; font-size: 14px;">Powered by Channel NewsAsia</p>
              </div>

              <div style="background: #f9fafb; padding: 20px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
                <p style="color: #666; font-size: 14px; margin: 0;">${currentDate}</p>
              </div>

              <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb;">
                <h2 style="color: #1f2937; margin-top: 0; font-size: 18px;">📝 Today's Summary</h2>
                <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${summary}</p>
              </div>

              <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
                <h2 style="color: #1f2937; margin-top: 0; font-size: 18px;">📌 Top Stories</h2>
                ${articlesHtml}
              </div>

              <div style="background: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  This digest includes ${allArticles.length} articles from Channel NewsAsia Singapore.
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
                  Generated with Groq AI • Delivered daily at 7:00 AM SGT
                </p>
              </div>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error("Resend API error:", errorData);
        throw new Error(`Email sending failed: ${errorData}`);
      }

      const emailData = await emailResponse.json();
      console.log("News digest email sent successfully:", emailData);

      return c.json({
        success: true,
        message: "Daily news digest email sent successfully",
        summary,
        emailId: emailData.id,
        articlesCount: allArticles.length
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return c.json({
        error: `Failed to send email: ${emailError.message || 'Unknown error'}`
      }, 500);
    }
  } catch (error) {
    console.error("Send news digest error:", error);
    return c.json({ error: `Failed to send news digest: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);