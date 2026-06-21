"use client";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Confidence, Card } from "@/components/ui";

export default function SearchExport() {
  const { docs } = useStore();
  const [q, setQ] = useState("");
  const [pushed, setPushed] = useState("");

  const rows = docs.flatMap((d) => d.extractions.map((e) => ({ doc: d, e })))
    .filter(({ doc, e }) => {
      if (!q.trim()) return true;
      const t = q.toLowerCase();
      return e.field.toLowerCase().includes(t) || e.value.toLowerCase().includes(t) || doc.name.toLowerCase().includes(t) || doc.type.toLowerCase().includes(t);
    });

  function download(name: string, content: string, mime: string) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  }
  const exportJson = () => download("documind-export.json", JSON.stringify(docs.map((d) => ({ document: d.name, type: d.type, status: d.status, fields: d.extractions.map((e) => ({ field: e.field, value: e.value, confidence: e.confidence, status: e.status })) })), null, 2), "application/json");
  const exportCsv = () => {
    const head = "document,type,field,value,confidence,status";
    const lines = docs.flatMap((d) => d.extractions.map((e) => [d.name, d.type, e.field, e.value, e.confidence, e.status].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")));
    download("documind-export.csv", [head, ...lines].join("\n"), "text/csv");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Search &amp; export</h1>
          <p className="text-slate-500 text-sm mt-1">Search every extracted field across all documents, then export structured data or push to your tools.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportJson} className="text-sm border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50">Export JSON</button>
          <button onClick={exportCsv} className="text-sm border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50">Export CSV</button>
          <button onClick={() => setPushed("Pushed " + rows.length + " rows to Airtable (mock).")} className="text-sm bg-indigo-600 text-white px-3 py-2 rounded-lg">Push to Airtable</button>
        </div>
      </div>
      {pushed && <div className="text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-2">{pushed}</div>}

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search fields, values, documents… (e.g. 'email', 'I-485', 'Priya')" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" />

      <Card>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
            <tr><th className="px-4 py-2.5">Document</th><th className="px-4 py-2.5">Field</th><th className="px-4 py-2.5">Value</th><th className="px-4 py-2.5">Confidence</th><th className="px-4 py-2.5">Status</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-4 text-slate-400">No matches.</td></tr>}
            {rows.map(({ doc, e }) => (
              <tr key={doc.id + e.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2.5"><Link href={`/doc/${doc.id}`} className="text-indigo-700 hover:underline">{doc.name}</Link></td>
                <td className="px-4 py-2.5 text-slate-500">{e.field}</td>
                <td className="px-4 py-2.5 font-medium">{e.value}</td>
                <td className="px-4 py-2.5"><Confidence value={e.confidence} /></td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
