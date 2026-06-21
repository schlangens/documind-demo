"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Confidence, StatusBadge, Card } from "@/components/ui";

export default function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { docs, approve, correct, ask } = useStore();
  const doc = docs.find((d) => d.id === id);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  if (!doc) return <div className="text-slate-500">Document not found. <Link href="/" className="text-indigo-700 underline">Back to library</Link></div>;

  const pageOf = (chunkId: string) => doc.chunks.find((c) => c.id === chunkId)?.page;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">← Library</Link>
        <h1 className="text-xl font-bold">{doc.name}</h1>
        <StatusBadge status={doc.status} />
        <span className="text-xs text-slate-400">{doc.type} · {doc.pages} pages</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Document preview with source highlighting */}
        <Card className="p-4 self-start lg:sticky lg:top-20">
          <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Document</div>
          <div className="space-y-3">
            {doc.chunks.length === 0 && <div className="text-slate-400 text-sm">No extracted text yet.</div>}
            {doc.chunks.map((c) => (
              <p key={c.id} id={`chunk-${c.id}`}
                 className={`text-sm leading-relaxed rounded-lg p-2.5 border transition ${highlight === c.id ? "bg-yellow-100 border-yellow-300" : "bg-slate-50 border-transparent"}`}>
                <span className="text-[10px] text-slate-400 mr-1">p.{c.page}</span>{c.text}
              </p>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          {/* Extracted fields */}
          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-3">Extracted fields</div>
            <div className="divide-y divide-slate-100">
              {doc.extractions.map((e) => (
                <div key={e.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-500">{e.field}</div>
                    <Confidence value={e.confidence} />
                  </div>
                  {editing === e.id ? (
                    <div className="flex gap-2 mt-1">
                      <input autoFocus value={draft} onChange={(ev) => setDraft(ev.target.value)} className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-sm" />
                      <button onClick={() => { correct(doc.id, e.id, draft); setEditing(null); }} className="text-xs bg-indigo-600 text-white px-2.5 rounded-md">Save</button>
                      <button onClick={() => setEditing(null)} className="text-xs text-slate-500 px-1">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <div className="font-medium text-sm">{e.value}</div>
                      <div className="flex items-center gap-2 shrink-0">
                        {e.status !== "auto" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">{e.status}</span>}
                        {e.flag && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{e.flag}</span>}
                        <button onMouseEnter={() => setHighlight(e.sourceChunkId)} onMouseLeave={() => setHighlight(null)}
                          onClick={() => { setHighlight(e.sourceChunkId); document.getElementById(`chunk-${e.sourceChunkId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                          className="text-[11px] text-indigo-600 hover:underline">source p.{pageOf(e.sourceChunkId)}</button>
                      </div>
                    </div>
                  )}
                  {e.status === "auto" && editing !== e.id && (
                    <div className="flex gap-3 mt-1">
                      <button onClick={() => approve(doc.id, e.id)} className="text-[11px] text-emerald-700 hover:underline">Approve</button>
                      <button onClick={() => { setEditing(e.id); setDraft(e.value); }} className="text-[11px] text-slate-500 hover:underline">Correct</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Chat this document */}
          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Ask this document</div>
            <div className="space-y-3 max-h-72 overflow-auto">
              {doc.qa.length === 0 && <div className="text-slate-400 text-sm">Ask a question — every answer cites the source it came from.</div>}
              {doc.qa.map((q) => (
                <div key={q.id} className="text-sm">
                  <div className="font-medium text-slate-800">{q.question}</div>
                  <div className="text-slate-600 mt-0.5">{q.answer}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {q.citations.map((cid) => (
                      <button key={cid} onClick={() => { setHighlight(cid); document.getElementById(`chunk-${cid}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                        className="text-[11px] text-indigo-600 hover:underline">cite p.{pageOf(cid)}</button>
                    ))}
                    <Confidence value={q.confidence} />
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (question.trim()) { ask(doc.id, question.trim()); setQuestion(""); } }} className="flex gap-2 mt-3">
              <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. What visa type is this?" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              <button className="bg-indigo-600 text-white text-sm font-medium px-4 rounded-lg">Ask</button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
