# Technical Documentation

## 🔧 Language & Technology Used

This system is written in **TypeScript/JavaScript** running on **Deno** (a modern JavaScript runtime).

```typescript
// This is TypeScript code
const response = await fetch(feedUrl);
const xmlText = await response.text();
```

**Runtime: Deno**
- Modern alternative to Node.js
- Built-in TypeScript support
- Runs on Supabase Edge Functions

### Why TypeScript/JavaScript?

✅ **Native `fetch()`** — Built-in HTTP requests, no library needed  
✅ **Regex support** — Easy XML parsing with patterns  
✅ **String manipulation** — Perfect for text processing  
✅ **Async/await** — Clean asynchronous code  
✅ **JSON handling** — Easy API communication  

---

## 🌐 Full Technology Stack

| Component | Technology |
|-----------|------------|
| Language | TypeScript (JavaScript with types) |
| Runtime | Deno (serverless) |
| Framework | Hono (web framework) |
| HTTP Requests | `fetch()` API (built-in) |
| XML Parsing | JavaScript Regex |
| AI API | Groq (REST API) |
| Email API | Resend (REST API) |
| Hosting | Supabase Edge Functions |

---

## 📝 Code Breakdown

### 1. HTTP Request (JavaScript fetch API)

```typescript
const response = await fetch("https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6511");
const xmlText = await response.text();
```

- **Language**: JavaScript/TypeScript
- **Function**: `fetch()` — Standard Web API
- **Returns**: XML as text string

### 2. XML Parsing (JavaScript Regex)

```typescript
// JavaScript Regular Expression
const itemRegex = /<item>(.*?)<\/item>/gs;
const items = [...xmlText.matchAll(itemRegex)];
```

- **Language**: JavaScript
- **Method**: Regex pattern matching
- No library needed!

### 3. Data Extraction (JavaScript String Methods)

```typescript
const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s);
const title = titleMatch[1].trim();
```

- **Language**: JavaScript
- **Methods**: `.match()`, `.trim()`, `.replace()`

### 4. AI Call (JavaScript fetch + JSON)

```typescript
const response = await fetch(GROQ_API_URL, {
  method: "POST",
  headers: { "Authorization": `Bearer ${GROQ_API_KEY}` },
  body: JSON.stringify({ model: "llama-3.3-70b-versatile", ... })
});
```

- **Language**: JavaScript
- **Format**: JSON

### 5. Email Send (JavaScript fetch)

```typescript
await fetch("https://api.resend.com/emails", {
  method: "POST",
  body: JSON.stringify({ from: "...", to: "...", html: "..." })
});
```

- **Language**: JavaScript

---

## 💡 Why NOT Python?

Python could do the same with libraries like:

```python
import feedparser  # For RSS parsing
import requests    # For HTTP requests
```

But TypeScript/JavaScript is better for this because:

- ✅ Runs on Supabase Edge Functions natively
- ✅ No package installation needed
- ✅ Built-in `fetch()` for HTTP
- ✅ Lightweight and fast
- ✅ Same language as frontend (React)

> **Summary: 100% TypeScript/JavaScript, no Python! 🚀**
