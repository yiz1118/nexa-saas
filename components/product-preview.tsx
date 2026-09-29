"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, BookOpenText, Diamond, FileText, LayoutDashboard, Plus, Search, Sparkles, Workflow } from "lucide-react";
import { collections, sampleAnswer, searchDocuments, seedDocuments, suggestedPrompts } from "@/lib/demo";
import { Modal } from "@/components/ui";

const sources = [seedDocuments[0], seedDocuments[2], seedDocuments[3]];
const questionLabels = ["Atlas release", "Research sources", "PDF uploads"];
const previewNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/app" },
  { icon: FileText, label: "Documents", href: "/app/documents" },
  { icon: BookOpenText, label: "Knowledge base", href: "/app/knowledge" },
  { icon: Sparkles, label: "AI chat", href: "/app/chat" },
  { icon: Workflow, label: "Workflows", href: "/app/workflows" },
];

export function ProductPreview({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [prompt, setPrompt] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const doc = seedDocuments.find(d => d.id === selected);
  const answer = sampleAnswer(suggestedPrompts[prompt], sources.map(d => d.id), sources);
  const documents = searchDocuments(sources, query);
  return <div className={`product-preview ${compact ? "preview-compact" : ""}`} aria-label="Interactive NEXA workspace preview">
    <div className="preview-top"><span className="preview-dots" aria-hidden="true"><i/><i/><i/></span><span>Northstar Studio / Interactive preview</span><span className="preview-top-right">DEMO</span></div>
    <div className="preview-body">
      <aside className="preview-side"><div className="preview-mini-brand"><span className="preview-brand-icon" aria-hidden="true"><Diamond size={12} strokeWidth={1.8} aria-hidden="true"><path d="m12 8 4 4-4 4-4-4Z" fill="currentColor" stroke="none"/></Diamond></span> <span>NEXA</span></div><nav aria-label="Preview navigation">{previewNav.map(({ icon: Icon, label, href }) => <Link key={href} href={href} aria-label={`Preview: ${label}`} className={`preview-side-item ${label === "Documents" ? "active" : ""}`}><span aria-hidden="true" className="preview-nav-icon"><Icon size={12} strokeWidth={1.8} aria-hidden="true"/></span><span className="preview-nav-label">{label}</span></Link>)}</nav></aside>
      <div className="preview-main">
        <div className="preview-kicker">WORKSPACE / DOCUMENTS</div>
        <div className="preview-title-row"><div><h2>Your team&apos;s knowledge,<br/>within reach.</h2><p>Try searching or open a source below.</p></div><Link className="preview-upload" href="/app/documents"><span className="preview-add-icon" aria-hidden="true"><Plus size={10} strokeWidth={1.8} aria-hidden="true"/></span> Add document</Link></div>
        <label className="preview-search"><Search size={14}/><input aria-label="Search preview documents" placeholder="Search sample documents" value={query} onChange={e => setQuery(e.target.value)}/></label>
        <div className="preview-grid">
          <div className="preview-list"><div className="preview-table-header"><span>DOCUMENT</span><span>COLLECTION</span><span>STATUS</span></div>{documents.map(d => <button type="button" className="preview-table-row" key={d.id} onClick={() => setSelected(d.id)}><span><FileText size={16}/><b>{d.title}</b><small>{d.kind} · {d.date.slice(5)}</small></span><span>{collections.find(c => c.id === d.collectionId)?.name}</span><span className="preview-ready"><i/> Ready</span></button>)}{!documents.length && <p className="preview-empty" role="status">No sample sources match. Try “Atlas” or “research”.</p>}</div>
          <div className="preview-insight"><div className="preview-insight-icon"><Sparkles size={16}/></div><label htmlFor="preview-question">SAMPLE QUESTION</label><select id="preview-question" value={prompt} onChange={e => setPrompt(Number(e.target.value))}>{questionLabels.map((label,i) => <option key={label} value={i}>{label}</option>)}</select><h3>{suggestedPrompts[prompt]}</h3><p>{answer.text}</p><button type="button" className="preview-source" onClick={() => setSelected(answer.citations[0].docId)}><FileText size={13}/><span>Open cited passage</span><ArrowUpRight size={13}/></button></div>
        </div>
      </div>
    </div>
    <Modal title="Preview source document" open={!!doc} onClose={() => setSelected(null)}>{doc && <div className="modal-form"><span className="eyebrow">FICTIONAL SOURCE / {doc.kind}</span><h3>{doc.title}</h3><p className="preview-source-text">{doc.text}</p><Link className="button button-dark" href="/app/chat">Explore the full chat <ArrowUpRight size={16}/></Link></div>}</Modal>
  </div>;
}
