const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-20250514';

async function callClaude(messages, system = null, maxTokens = 1000) {
  const body = { model: MODEL, max_tokens: maxTokens, messages };
  if (system) body.system = system;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${err}`);
  }
  return res.json();
}

// POST /api/generate — parse resume and return structured profile JSON
app.post('/api/generate', async (req, res) => {
  const { resume } = req.body;
  if (!resume) return res.status(400).json({ error: 'Resume text is required.' });

  try {
    const data = await callClaude([{
      role: 'user',
      content: `Extract structured career data from this resume. Return ONLY valid JSON, no markdown fences, no preamble.

Schema:
{
  "name": "Full Name",
  "initials": "XX",
  "tag": "Job Title",
  "role": "Role · Location",
  "summary": "2-3 sentence professional summary",
  "meta": ["Open to work", "Hybrid · Bengaluru", "IIT Hyderabad"],
  "skills": [
    { "name": "LLMs & GenAI", "pct": 92 },
    { "name": "Python", "pct": 90 },
    { "name": "RAG Pipelines", "pct": 87 },
    { "name": "NLP", "pct": 82 },
    { "name": "MLOps", "pct": 76 }
  ],
  "techTags": ["LangChain", "OpenAI API", "FAISS", "Pinecone", "HuggingFace", "PyTorch", "SQL"],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "period": "Year–Year",
      "bullets": ["Achievement 1", "Achievement 2"]
    }
  ],
  "projects": [
    { "title": "Project Name", "desc": "Short description", "tags": ["Tech1", "Tech2"] }
  ],
  "certifications": [
    { "name": "Cert Name", "org": "Issuer", "icon": "★" }
  ],
  "socials": [
    { "label": "LinkedIn", "handle": "linkedin.com/in/yourhandle", "bg": "#E6F1FB", "color": "#0C447C", "icon": "in" },
    { "label": "GitHub",   "handle": "github.com/yourhandle",   "bg": "#2C2C2A", "color": "#F1EFE8", "icon": "gh" },
    { "label": "Email",    "handle": "you@email.com",            "bg": "#FAEEDA", "color": "#633806", "icon": "@"  }
  ],
  "chatSuggestions": [
    "What is your GenAI experience?",
    "Are you open to contract roles?",
    "Tell me about your RAG projects",
    "What's your notice period?"
  ]
}

Resume:
${resume}`
    }]);

    const raw = data.content.map(c => c.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    const profile = JSON.parse(clean);
    res.json(profile);
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat — recruiter chatbot
app.post('/api/chat', async (req, res) => {
  const { messages, system } = req.body;
  if (!messages) return res.status(400).json({ error: 'Messages are required.' });

  try {
    const data = await callClaude(messages, system);
    const reply = data.content.map(c => c.text || '').join('').trim();
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Catch-all: serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BragSheet running on http://localhost:${PORT}`);
});
