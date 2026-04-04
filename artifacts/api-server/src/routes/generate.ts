import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { GenerateProfileBody } from "@workspace/api-zod";

const router = Router();

router.post("/", async (req, res) => {
  const body = GenerateProfileBody.parse(req.body);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `Extract structured career data from this resume. Return ONLY valid JSON, no markdown fences, no preamble.

Schema:
{
  "name": "Full Name",
  "initials": "XX",
  "tag": "Job Title",
  "role": "Role · Location",
  "summary": "2-3 sentence professional summary highlighting key expertise and value",
  "meta": ["Open to work", "Location", "Education"],
  "skills": [
    { "name": "Skill Name", "pct": 92 }
  ],
  "techTags": ["Tech1", "Tech2", "Tech3"],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "period": "Year–Year",
      "bullets": ["Specific achievement 1 with metrics", "Achievement 2"]
    }
  ],
  "projects": [
    { "title": "Project Name", "desc": "One sentence description of what it does and its impact", "tags": ["Tech1", "Tech2"] }
  ],
  "certifications": [
    { "name": "Cert Name", "org": "Issuer", "icon": "★" }
  ],
  "socials": [
    { "label": "LinkedIn", "handle": "linkedin.com/in/handle", "bg": "#E6F1FB", "color": "#0C447C", "icon": "in" },
    { "label": "GitHub",   "handle": "github.com/handle",   "bg": "#1a1a1a", "color": "#ffffff", "icon": "gh" },
    { "label": "Email",    "handle": "email@example.com",   "bg": "#FEF3C7", "color": "#92400E", "icon": "@"  }
  ],
  "chatSuggestions": [
    "What is your strongest technical skill?",
    "Are you open to contract roles?",
    "What's your most impactful project?",
    "What's your notice period?"
  ]
}

Rules:
- skills: include top 5-7 skills with realistic proficiency percentages (60-95 range)
- techTags: include all technologies, tools, and frameworks mentioned (up to 15)
- bullets: specific, achievement-oriented, include metrics where mentioned
- chatSuggestions: make them relevant to this person's specific background
- socials: extract real handles if mentioned, otherwise use placeholder format
- initials: first 2 letters of first+last name
- meta: 2-3 relevant status tags (availability, location, education)

Resume:
${body.resume}`,
      },
    ],
  });

  const raw = message.content.map((c) => (c.type === "text" ? c.text : "")).join("");
  const clean = raw.replace(/```json|```/g, "").trim();

  const profile = JSON.parse(clean);
  res.json(profile);
});

export default router;
