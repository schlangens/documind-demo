import type { Doc, Chunk } from "./types";

const STOP = new Set(["the", "a", "an", "of", "to", "is", "are", "was", "what", "which", "who", "did", "does", "do", "on", "in", "for", "this", "that", "and", "or", "with", "how", "many", "much", "applicant", "candidate", "document"]);

function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9@.\- ]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
}

/** Deterministic "RAG": score each chunk by keyword overlap with the question, return the best
 *  chunk(s) as the grounded answer + citations + a confidence derived from overlap. Stands in for
 *  precomputed embeddings + retrieval so the demo needs no live AI. */
export function answerQuestion(doc: Doc, question: string): { answer: string; citations: string[]; confidence: number } {
  const q = tokens(question);
  const scored = doc.chunks.map((c: Chunk) => {
    const ct = tokens(c.text);
    const hits = q.filter((w) => ct.some((t) => t === w || t.includes(w) || w.includes(t))).length;
    return { c, score: hits };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0];
  if (!top || top.score === 0) {
    return { answer: "I couldn't find that in this document. Try rephrasing, or it may not be covered here.", citations: [], confidence: 0.2 };
  }
  const supporting = scored.filter((s) => s.score >= Math.max(1, top.score - 1)).slice(0, 2);
  const confidence = Math.min(0.97, 0.55 + top.score * 0.12);
  const answer = supporting.map((s) => s.c.text).join(" ");
  return { answer, citations: supporting.map((s) => s.c.id), confidence };
}
