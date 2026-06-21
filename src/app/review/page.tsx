"use client";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Confidence, Card } from "@/components/ui";

export default function ReviewQueue() {
  const { docs, reviews, approve, correct } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const items = docs.flatMap((d) =>
    d.extractions.filter((e) => e.status === "auto" && (e.confidence < 0.6 || e.flag)).map((e) => ({ doc: d, e }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Review queue</h1>
        <p className="text-slate-500 text-sm mt-1">Low-confidence or flagged extractions wait here for a human to approve or correct. <strong>The AI never finalizes on its own.</strong> Every action is logged below.</p>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">🎉 Queue is clear — every extraction has been reviewed.</Card>
      ) : (
        <div className="space-y-3">
          {items.map(({ doc, e }) => {
            const src = doc.chunks.find((c) => c.id === e.sourceChunkId);
            return (
              <Card key={doc.id + e.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/doc/${doc.id}`} className="text-sm font-medium text-indigo-700 hover:underline">{doc.name}</Link>
                  <div className="flex items-center gap-2">
                    {e.flag && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{e.flag}</span>}
                    <Confidence value={e.confidence} />
                  </div>
                </div>
                <div className="mt-2 grid sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500">{e.field}</div>
                    {editing === doc.id + e.id ? (
                      <div className="flex gap-2 mt-1">
                        <input autoFocus value={draft} onChange={(ev) => setDraft(ev.target.value)} className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-sm" />
                        <button onClick={() => { correct(doc.id, e.id, draft); setEditing(null); }} className="text-xs bg-indigo-600 text-white px-2.5 rounded-md">Save</button>
                        <button onClick={() => setEditing(null)} className="text-xs text-slate-500">Cancel</button>
                      </div>
                    ) : (
                      <div className="font-medium">{e.value}</div>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <span className="text-[10px] text-slate-400">source p.{src?.page}: </span>{src?.text}
                  </div>
                </div>
                {editing !== doc.id + e.id && (
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => approve(doc.id, e.id)} className="text-xs font-medium bg-emerald-600 text-white px-3 py-1.5 rounded-md">Approve as-is</button>
                    <button onClick={() => { setEditing(doc.id + e.id); setDraft(e.value === "(not found)" ? "" : e.value); }} className="text-xs font-medium border border-slate-300 px-3 py-1.5 rounded-md">Correct</button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-2">Audit trail</h2>
        <Card>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
              <tr><th className="px-4 py-2.5">When</th><th className="px-4 py-2.5">Field</th><th className="px-4 py-2.5">Action</th><th className="px-4 py-2.5">Before → After</th><th className="px-4 py-2.5">By</th></tr>
            </thead>
            <tbody>
              {reviews.length === 0 && <tr><td colSpan={5} className="px-4 py-4 text-slate-400">No actions yet.</td></tr>}
              {[...reviews].reverse().map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2 text-xs text-slate-500">{new Date(r.at).toLocaleString()}</td>
                  <td className="px-4 py-2">{r.field}</td>
                  <td className="px-4 py-2"><span className={`text-xs px-1.5 py-0.5 rounded ${r.action === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>{r.action}</span></td>
                  <td className="px-4 py-2 text-xs text-slate-600">{r.before} → <strong>{r.after}</strong></td>
                  <td className="px-4 py-2 text-xs text-slate-500">{r.reviewer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
