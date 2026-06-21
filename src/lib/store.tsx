"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Doc, ReviewEntry, QA } from "./types";
import { SEED_DOCS, SEED_REVIEWS } from "./seed";
import { answerQuestion } from "./ai";

const KEY = "documind-state-v1";

interface State { docs: Doc[]; reviews: ReviewEntry[]; }
interface Ctx extends State {
  approve: (docId: string, extractionId: string) => void;
  correct: (docId: string, extractionId: string, newValue: string) => void;
  ask: (docId: string, question: string) => QA | null;
  addDoc: (name: string, type: string) => string;
}

const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ docs: SEED_DOCS, reviews: SEED_REVIEWS });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setState(JSON.parse(raw)); } catch { /* ignore */ }
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }, [state, hydrated]);

  const recompute = (d: Doc): Doc => {
    const stillFlagged = d.extractions.some((e) => e.status === "auto" && (e.confidence < 0.6 || e.flag));
    return { ...d, status: stillFlagged ? "needs_review" : "ready" };
  };

  const approve = useCallback((docId: string, extractionId: string) => setState((s) => {
    const reviews = [...s.reviews];
    const docs = s.docs.map((d) => {
      if (d.id !== docId) return d;
      const extractions = d.extractions.map((e) => {
        if (e.id !== extractionId) return e;
        reviews.push({ id: "rv" + Date.now(), docId, extractionId, field: e.field, reviewer: "demo", action: "approved", before: e.value, after: e.value, at: new Date().toISOString() });
        return { ...e, status: "approved" as const, flag: undefined };
      });
      return recompute({ ...d, extractions });
    });
    return { docs, reviews };
  }), []);

  const correct = useCallback((docId: string, extractionId: string, newValue: string) => setState((s) => {
    const reviews = [...s.reviews];
    const docs = s.docs.map((d) => {
      if (d.id !== docId) return d;
      const extractions = d.extractions.map((e) => {
        if (e.id !== extractionId) return e;
        reviews.push({ id: "rv" + Date.now(), docId, extractionId, field: e.field, reviewer: "demo", action: "corrected", before: e.value, after: newValue, at: new Date().toISOString() });
        return { ...e, value: newValue, confidence: 1, status: "corrected" as const, flag: undefined };
      });
      return recompute({ ...d, extractions });
    });
    return { docs, reviews };
  }), []);

  const ask = useCallback((docId: string, question: string): QA | null => {
    let created: QA | null = null;
    setState((s) => ({
      ...s,
      docs: s.docs.map((d) => {
        if (d.id !== docId) return d;
        const r = answerQuestion(d, question);
        created = { id: "q" + Date.now(), question, answer: r.answer, citations: r.citations, confidence: r.confidence };
        return { ...d, qa: [...d.qa, created] };
      }),
    }));
    return created;
  }, []);

  const addDoc = useCallback((name: string, type: string): string => {
    const id = "doc-new-" + Date.now();
    setState((s) => ({ ...s, docs: [{ id, name, type, status: "processing", owner: "demo", createdAt: new Date().toISOString(), pages: 1, chunks: [], extractions: [], qa: [] }, ...s.docs] }));
    // simulate processing -> ready
    setTimeout(() => setState((s) => ({ ...s, docs: s.docs.map((d) => d.id === id ? { ...d, status: "ready", chunks: [{ id: "c1", page: 1, text: "Uploaded sample. In production this text is OCR-extracted, chunked, and embedded." }], extractions: [{ id: "e1", field: "Document Type", value: type, confidence: 0.8, sourceChunkId: "c1", status: "auto" }] } : d) })), 2600);
    return id;
  }, []);

  return <C.Provider value={{ ...state, approve, correct, ask, addDoc }}>{children}</C.Provider>;
}

export function useStore() {
  const c = useContext(C);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}
