"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { StatusBadge, Card } from "@/components/ui";

export default function Library() {
  const { docs, addDoc } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const ready = docs.filter((d) => d.status === "ready").length;
  const review = docs.filter((d) => d.status === "needs_review").length;

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    Array.from(files).forEach((f) => {
      const type = /resume|cv/i.test(f.name) ? "Résumé / CV" : "Immigration Intake";
      addDoc(f.name, type);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Document library</h1>
        <p className="text-slate-500 text-sm mt-1">Upload documents → DocuMind extracts structured fields and answers questions, every answer cited and scored. Low-confidence items route to human review.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-md">
        <Card className="p-3"><div className="text-2xl font-bold">{docs.length}</div><div className="text-xs text-slate-500">Documents</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-emerald-600">{ready}</div><div className="text-xs text-slate-500">Ready</div></Card>
        <Card className="p-3"><div className="text-2xl font-bold text-amber-600">{review}</div><div className="text-xs text-slate-500">Needs review</div></Card>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-xl py-8 text-center transition ${drag ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-white hover:border-slate-400"}`}
      >
        <input ref={fileRef} type="file" multiple accept=".pdf,image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <div className="text-3xl">⬆️</div>
        <div className="font-medium mt-1">Drop documents here or click to upload</div>
        <div className="text-xs text-slate-500 mt-1">PDF or image · they’ll process, then appear below (demo simulates extraction)</div>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
            <tr><th className="px-4 py-2.5">Document</th><th className="px-4 py-2.5">Type</th><th className="px-4 py-2.5">Fields</th><th className="px-4 py-2.5">Uploaded</th><th className="px-4 py-2.5">Status</th></tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  {d.status === "processing"
                    ? <span className="text-slate-400">{d.name} <span className="text-xs">(processing…)</span></span>
                    : <Link href={`/doc/${d.id}`} className="font-medium text-indigo-700 hover:underline">{d.name}</Link>}
                </td>
                <td className="px-4 py-3 text-slate-600">{d.type}</td>
                <td className="px-4 py-3 text-slate-600">{d.extractions.length}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(d.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
