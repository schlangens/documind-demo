export type DocStatus = "processing" | "ready" | "needs_review";
export type ExtractionStatus = "auto" | "approved" | "corrected";

export interface Chunk {
  id: string;
  page: number;
  text: string;
}

export interface Extraction {
  id: string;
  field: string;
  value: string;
  confidence: number;        // 0..1
  sourceChunkId: string;     // which chunk this came from (citation)
  status: ExtractionStatus;
  flag?: string;             // e.g. "missing info", "priority", "low confidence"
}

export interface QA {
  id: string;
  question: string;
  answer: string;
  citations: string[];       // chunk ids supporting the answer
  confidence: number;
}

export interface ReviewEntry {
  id: string;
  docId: string;
  extractionId: string;
  field: string;
  reviewer: string;
  action: "approved" | "corrected";
  before: string;
  after: string;
  at: string;
}

export interface Doc {
  id: string;
  name: string;
  type: string;              // "Immigration Intake" | "Résumé / CV"
  status: DocStatus;
  owner: string;
  createdAt: string;
  pages: number;
  chunks: Chunk[];
  extractions: Extraction[];
  qa: QA[];
}
