export type DocumentKind = "PDF" | "DOCX" | "TXT" | "MD";
export type DocumentStatus = "Ready" | "Metadata only";
export type Doc = { id: string; title: string; kind: DocumentKind; size: number; date: string; owner: string; collectionId: string; status: DocumentStatus; text: string; tags: string[]; seeded: boolean };
export type Collection = { id: string; name: string; description: string; color: string };
export type Citation = { docId: string; excerpt: string };
export type Message = { id: string; role: "user" | "assistant"; text: string; citations?: Citation[]; sample?: boolean; createdAt: string };
export type Conversation = { id: string; title: string; messages: Message[]; updatedAt: string };
export type WorkflowStep = "document-added" | "summarize" | "extract-actions" | "workspace-note";
export type Workflow = { id: string; name: string; enabled: boolean; steps: WorkflowStep[]; lastRun?: string };
export type WorkflowRun = { id: string; workflowId: string; documentId: string; at: string; status: "Completed" | "Failed"; summary: string; actions: string[]; error?: string };
export type Member = { id: string; name: string; email: string; role: "Admin" | "Editor" | "Viewer"; initials: string; color: string };
export type Activity = { id: string; type: "document" | "chat" | "workflow" | "team"; text: string; at: string };
export type UsageDay = { date: string; questions: number; documents: number };
export type WorkspaceState = { version: 1; workspace: string; name: string; email: string; notifications: boolean; documents: Doc[]; collections: Collection[]; conversations: Conversation[]; workflows: Workflow[]; runs: WorkflowRun[]; members: Member[]; activity: Activity[] };

export const STORAGE_KEY = "nexa-concept-v1";
export const SAMPLE_LABEL = "Fictional sample data";
export const collections: Collection[] = [
  { id: "product", name: "Product", description: "Roadmaps, decisions, and launch plans", color: "teal" },
  { id: "operations", name: "Operations", description: "Team processes and service playbooks", color: "blue" },
  { id: "research", name: "Research", description: "Interviews, findings, and market notes", color: "amber" },
  { id: "engineering", name: "Engineering", description: "Architecture and technical handovers", color: "violet" },
];

const seedText = {
  handover: "Project Atlas handover. The onboarding checklist owner is Maya Chen. The team must finish the accessibility review before the October 15 release. Open items: confirm keyboard navigation in the invitation dialog, document empty states, and publish the support runbook. The release review is scheduled for October 10. Any unresolved critical accessibility issue blocks release.",
  roadmap: "Q4 product roadmap. Priority one is faster knowledge retrieval across project documents. The team will ship collection filters and source references first. Workflow templates follow after the search experience is stable. Success is measured through task completion in usability sessions, not an accuracy guarantee.",
  interviews: "Customer interview synthesis. Participants struggled to identify which document supported an answer. They requested visible source names, quoted passages, and an easy route back to the original material. Several participants also wanted a clear distinction between an example answer and a verified fact.",
  runbook: "Support runbook. For an indexing delay, check the document status first. Text and Markdown files are searchable in the local demo after upload. PDF and DOCX files are stored as metadata only in the demo and their contents are not indexed. Escalate persistent issues to the workspace admin.",
  architecture: "Workspace architecture. Documents belong to collections. Chat messages can reference curated source excerpts. Local browser storage holds demo state on this device. No uploaded file or conversation is sent to a server by this concept application. Reset demo clears local changes and restores fictional sample data.",
  launch: "Launch readiness checklist. Finalize release notes, review the support runbook, and complete accessibility testing. Maya Chen owns the invitation-dialog review. Jonah Patel owns the support documentation. The release gate is October 15, with a review on October 10.",
};

const base = (id: string, title: string, kind: DocumentKind, collectionId: string, owner: string, date: string, text: string, tags: string[]): Doc => ({ id, title, kind, collectionId, owner, date, text, tags, size: kind === "PDF" ? 842000 : kind === "DOCX" ? 314000 : text.length * 2, status: text ? "Ready" : "Metadata only", seeded: true });
export const seedDocuments: Doc[] = [
  base("atlas-handover", "Project Atlas handover", "MD", "product", "Maya Chen", "2026-09-27", seedText.handover, ["handover", "release"]),
  base("q4-roadmap", "Q4 product roadmap", "TXT", "product", "Maya Chen", "2026-09-25", seedText.roadmap, ["roadmap", "planning"]),
  base("customer-interviews", "Customer interview synthesis", "MD", "research", "Eli Brooks", "2026-09-24", seedText.interviews, ["research", "sources"]),
  base("support-runbook", "Support runbook", "TXT", "operations", "Jonah Patel", "2026-09-23", seedText.runbook, ["support", "process"]),
  base("workspace-architecture", "Workspace architecture", "MD", "engineering", "Sofia Reyes", "2026-09-21", seedText.architecture, ["architecture", "storage"]),
  base("launch-checklist", "Launch readiness checklist", "MD", "product", "Maya Chen", "2026-09-20", seedText.launch, ["launch", "actions"]),
  base("design-system", "Design system principles", "PDF", "product", "Eli Brooks", "2026-09-18", "", ["design"]),
  base("vendor-review", "Vendor review notes", "DOCX", "operations", "Jonah Patel", "2026-09-16", "", ["vendors"]),
  base("api-contract", "API contract draft", "MD", "engineering", "Sofia Reyes", "2026-09-14", "API contract draft. Collection IDs are stable strings. Document metadata includes owner, type, date, and indexing state. The concept app has no public API endpoint.", ["api"]),
  base("research-plan", "Autumn research plan", "TXT", "research", "Eli Brooks", "2026-09-12", "Autumn research plan. Interview five fictional team roles using task-based scenarios. Evaluate source discovery, navigation, and document organization.", ["planning"]),
  base("incident-review", "Incident review template", "PDF", "operations", "Jonah Patel", "2026-09-10", "", ["template"]),
  base("sprint-notes", "Sprint 38 notes", "DOCX", "engineering", "Sofia Reyes", "2026-09-08", "", ["sprint"]),
];

export const members: Member[] = [
  { id: "maya", name: "Maya Chen", email: "maya@example.test", role: "Admin", initials: "MC", color: "teal" },
  { id: "jonah", name: "Jonah Patel", email: "jonah@example.test", role: "Editor", initials: "JP", color: "amber" },
  { id: "eli", name: "Eli Brooks", email: "eli@example.test", role: "Editor", initials: "EB", color: "blue" },
  { id: "sofia", name: "Sofia Reyes", email: "sofia@example.test", role: "Editor", initials: "SR", color: "violet" },
  { id: "nora", name: "Nora Kim", email: "nora@example.test", role: "Viewer", initials: "NK", color: "rose" },
];
export const suggestedPrompts = ["What is blocking the Atlas release?", "What did interviews say about source references?", "How are PDF files handled in this demo?"];
export const stepNames: Record<WorkflowStep, string> = { "document-added": "Document added", summarize: "Summarize", "extract-actions": "Extract action items", "workspace-note": "Add workspace note" };
export const steps: WorkflowStep[] = ["document-added", "summarize", "extract-actions", "workspace-note"];

export function initialState(): WorkspaceState { return {
  version: 1, workspace: "Northstar Studio", name: "Alex Morgan", email: "alex@example.test", notifications: true,
  documents: seedDocuments.map(d => ({ ...d, tags: [...d.tags] })), collections: collections.map(c => ({ ...c })), conversations: [],
  workflows: [
    { id: "wf-handover", name: "Handover digest", enabled: true, steps: [...steps], lastRun: "2026-09-27" },
    { id: "wf-research", name: "Research brief", enabled: true, steps: ["document-added", "summarize", "workspace-note"], lastRun: "2026-09-24" },
    { id: "wf-review", name: "Release review", enabled: false, steps: ["document-added", "summarize", "extract-actions", "workspace-note"] },
  ], runs: [], members: members.map(m => ({ ...m })),
  activity: [
    { id: "a1", type: "document", text: "Maya added Project Atlas handover", at: "2026-09-27T10:24:00Z" },
    { id: "a2", type: "workflow", text: "Handover digest completed a sample run", at: "2026-09-27T10:26:00Z" },
    { id: "a3", type: "chat", text: "Eli explored source references", at: "2026-09-26T14:17:00Z" },
    { id: "a4", type: "document", text: "Jonah updated Support runbook", at: "2026-09-23T09:42:00Z" },
    ...Array.from({ length: 26 }, (_, i): Activity => ({ id: `a${i + 5}`, type: ["document", "chat", "workflow", "team"][i % 4] as Activity["type"], text: ["Sofia reviewed the architecture notes", "Maya explored a prepared roadmap answer", "Research brief completed a fictional sample run", "Nora reviewed a collection"][i % 4], at: new Date(Date.UTC(2026, 8, 23 - i, 10, 0)).toISOString() })),
  ],
}; }

export const historicalUsage: UsageDay[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 8, i + 1)).toISOString().slice(0, 10);
  return { date, questions: 12 + ((i * 7 + 9) % 22) + Math.floor(i / 5), documents: 1 + ((i * 3 + 2) % 6) };
});
export function formatBytes(bytes: number): string { return bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1048576).toFixed(1)} MB`; }
export function searchDocuments(docs: Doc[], query: string): Doc[] { const q = query.trim().toLowerCase(); return q ? docs.filter(d => `${d.title} ${d.tags.join(" ")} ${d.text}`.toLowerCase().includes(q)) : docs; }
export function documentType(file: Pick<File, "name" | "type" | "size">): { kind: DocumentKind; status: DocumentStatus } | { error: string } {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !["txt", "md", "pdf", "docx"].includes(ext)) return { error: "Use a TXT, Markdown, PDF, or DOCX file." };
  const text = ext === "txt" || ext === "md";
  if (file.size > (text ? 1048576 : 10485760)) return { error: text ? "Text files must be 1 MB or smaller." : "PDF and DOCX files must be 10 MB or smaller." };
  if (!file.size) return { error: "Choose a file that is not empty." };
  return { kind: ext.toUpperCase() as DocumentKind, status: text ? "Ready" : "Metadata only" };
}
export function sampleAnswer(question: string, allowedIds: string[], docs: Doc[]): { text: string; citations: Citation[] } {
  const q = question.toLowerCase();
  const scenarios = [
    { supports: q.includes("atlas") && (q.includes("release") || q.includes("block") || q.includes("accessibility")), id: "atlas-handover", excerpt: "The team must finish the accessibility review before the October 15 release.", text: "The Atlas release depends on completing the accessibility review. The invitation dialog's keyboard navigation and empty states are still open. A critical accessibility issue would block the October 15 release." },
    { supports: (q.includes("interview") || q.includes("research")) && (q.includes("source") || q.includes("reference")), id: "customer-interviews", excerpt: "They requested visible source names, quoted passages, and an easy route back to the original material.", text: "The interview synthesis says people had trouble identifying the document behind an answer. They asked for named sources, quoted passages, and a direct way back to the original material." },
    { supports: (q.includes("pdf") || q.includes("docx")) && (q.includes("demo") || q.includes("handl") || q.includes("index") || q.includes("search")), id: "support-runbook", excerpt: "PDF and DOCX files are stored as metadata only in the demo and their contents are not indexed.", text: "In this local demo, PDF and DOCX uploads keep their metadata. Their contents are not parsed or searchable. TXT and Markdown content can be searched after upload." },
  ];
  const matched = scenarios.find(s => s.supports && allowedIds.includes(s.id) && docs.some(d => d.id === s.id && d.text.includes(s.excerpt)));
  return matched ? { text: matched.text, citations: [{ docId: matched.id, excerpt: matched.excerpt }] } : { text: "This demo has no prepared answer for that question in the selected documents. Try a suggested prompt or open a source document to inspect its text. No AI model processed your question.", citations: [] };
}
export function validateWorkflow(workflow: Workflow): string | null {
  if (!workflow.name.trim()) return "Give the workflow a name.";
  if (!workflow.steps.length || workflow.steps[0] !== "document-added") return "Start with Document added.";
  if (workflow.steps.length < 2) return "Add at least one action after the trigger.";
  if (workflow.steps.slice(1).includes("document-added")) return "Document added can only be the first step.";
  if (workflow.steps.includes("extract-actions") && !workflow.steps.includes("summarize")) return "Add Summarize before Extract action items.";
  if (workflow.steps.includes("extract-actions") && workflow.steps.indexOf("extract-actions") < workflow.steps.indexOf("summarize")) return "Summarize must come before Extract action items.";
  if (workflow.steps.includes("workspace-note") && workflow.steps.at(-1) !== "workspace-note") return "Add workspace note must be the final step.";
  return null;
}
export function sampleWorkflowOutput(doc: Doc): { summary: string; actions: string[] } | null {
  if (doc.id === "atlas-handover" || doc.id === "launch-checklist") return { summary: "Project Atlas is preparing for an October 15 release. Accessibility review and support readiness remain key release tasks.", actions: ["Maya: confirm keyboard navigation in the invitation dialog", "Document empty states", "Jonah: publish the support runbook"] };
  if (doc.id === "customer-interviews") return { summary: "Research participants wanted to see the documents and quoted passages behind answers.", actions: ["Show source names in answers", "Link quoted passages to original documents"] };
  return null;
}
export function validSavedState(value: unknown): value is WorkspaceState {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<WorkspaceState>;
  const strings = (item: unknown, keys: string[]) => !!item && typeof item === "object" && keys.every(key => typeof (item as Record<string, unknown>)[key] === "string");
  const array = (items: unknown, check: (item: unknown) => boolean) => Array.isArray(items) && items.every(check);
  const optionalString = (item: unknown) => item === undefined || typeof item === "string";
  return s.version === 1 && strings(s, ["workspace", "name", "email"]) && typeof s.notifications === "boolean"
    && array(s.documents, d => strings(d, ["id", "title", "kind", "date", "owner", "collectionId", "status", "text"]) && ["PDF", "DOCX", "TXT", "MD"].includes((d as Doc).kind) && ["Ready", "Metadata only"].includes((d as Doc).status) && Number.isFinite((d as Doc).size) && (d as Doc).size >= 0 && typeof (d as Doc).seeded === "boolean" && array((d as Doc).tags, tag => typeof tag === "string"))
    && array(s.collections, c => strings(c, ["id", "name", "description", "color"]))
    && array(s.conversations, c => strings(c, ["id", "title", "updatedAt"]) && array((c as Conversation).messages, m => strings(m, ["id", "role", "text", "createdAt"]) && ["user", "assistant"].includes((m as Message).role) && ((m as Message).sample === undefined || typeof (m as Message).sample === "boolean") && ((m as Message).citations === undefined || array((m as Message).citations, cite => strings(cite, ["docId", "excerpt"])))))
    && array(s.workflows, w => strings(w, ["id", "name"]) && typeof (w as Workflow).enabled === "boolean" && optionalString((w as Workflow).lastRun) && array((w as Workflow).steps, step => steps.includes(step as WorkflowStep)))
    && array(s.runs, r => strings(r, ["id", "workflowId", "documentId", "at", "status", "summary"]) && ["Completed", "Failed"].includes((r as WorkflowRun).status) && optionalString((r as WorkflowRun).error) && array((r as WorkflowRun).actions, action => typeof action === "string"))
    && array(s.members, m => strings(m, ["id", "name", "email", "role", "initials", "color"]) && ["Admin", "Editor", "Viewer"].includes((m as Member).role))
    && array(s.activity, a => strings(a, ["id", "type", "text", "at"]) && ["document", "chat", "workflow", "team"].includes((a as Activity).type));
}


