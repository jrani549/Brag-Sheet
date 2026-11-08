# BragSheet

**Turn a resume into a polished, shareable career page in under a minute.**

BragSheet is an AI-powered career page builder. Upload or paste a resume, and it generates a personalised career page with your skills, experience and projects, plus a recruiter chatbot that answers questions about you.

**Live demo:** [brag-sheet--jrani549.replit.app](https://brag-sheet--jrani549.replit.app)

Built for the **Replit Buildathon**.

---

## Why I built it

Resumes are static, and recruiters spend seconds on each one. BragSheet turns a resume into an interactive page that a recruiter can explore, share and question, so a candidate's strengths are easier to find.

## Features

- **Resume parsing:** extracts unstructured resume text into a consistent, structured JSON profile using the Claude API
- **Career page generation:** builds a personalised page with summary, skills, experience, projects and certifications
- **Recruiter chatbot:** answers questions about the candidate using the resume as context
- **Export and sharing:** download the page as HTML or share it via link

## How it works

1. The user uploads or pastes a resume.
2. The backend sends the text to the Claude API with a strict JSON schema, so the output is predictable and easy to render.
3. The structured profile drives the career page components in the frontend.
4. The recruiter chatbot uses the same profile as context to answer questions accurately and stay on topic.

## Tech stack

| Layer | Tools |
|---|---|
| Language | TypeScript |
| AI | Claude API (structured output, conversational chat) |
| Frontend | HTML, CSS, TypeScript components |
| Tooling | pnpm workspaces, Node.js |
| Hosting | Replit |

## Getting started

### Prerequisites
- Node.js 18+
- pnpm
- An Anthropic API key

### Run locally

```bash
git clone https://github.com/jrani549/Brag-Sheet.git
cd Brag-Sheet
pnpm install
```

Set your API key as an environment variable (never commit it):

```bash
export ANTHROPIC_API_KEY=your_key_here
```

Then start the app:

```bash
pnpm dev
```

## Project structure
