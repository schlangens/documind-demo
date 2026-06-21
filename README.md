# DocuMind — Document AI you can trust

Upload documents → get **structured fields and answers, every one with a citation and a confidence score**. Low-confidence or flagged extractions route to a **human review queue** before anything is final. Per-user isolation so documents stay private.

**Live demo:** https://documind-demo.vercel.app
*(Demo runs on seeded sample data in a deterministic mock-AI mode — no live AI calls. Sample documents are fictional.)*

## What it demonstrates
- **Extraction with provenance** — each field shows its value, a confidence score, and a clickable **source** that highlights exactly where in the document it came from.
- **Ask-this-document chat** — every answer is grounded in retrieved chunks and shows inline **citations** (no ungrounded hallucinations).
- **Human-in-the-loop review** — anything low-confidence or flagged ("missing info", "priority") goes to a review queue to approve or correct, with a full **audit trail**. The AI never auto-finalizes.
- **Search & export** — search every extracted field across documents; export JSON/CSV or push to Airtable/Sheets (mock).

## Stack
Next.js (App Router) · TypeScript · Tailwind. **Production architecture:** Supabase (Postgres + **pgvector** + Auth + Storage) with **per-user row-level security**, and OpenAI for embeddings + extraction/answers. In this demo those are simulated deterministically (precomputed chunks, keyword retrieval) so it runs with zero keys and zero cost.

## Pipeline (production)
upload → OCR/text extract → chunk → embed (pgvector) → extraction prompts returning structured fields **with confidence + source chunk** → retrieval-grounded Q&A with citations → low-confidence routes to human review → approved data is exportable.

## Run locally
```bash
npm install
npm run dev
```
Demo state persists in the browser (localStorage); clear it to reset to seeded data.

© 2026 No404 — portfolio demo, all rights reserved.
