"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Activity, Doc, documentType, initialState, Member, Message, sampleAnswer, sampleWorkflowOutput, STORAGE_KEY, validSavedState, validateWorkflow, Workflow, WorkflowRun, WorkspaceState } from "@/lib/demo";

type WorkspaceContextValue = {
  state: WorkspaceState; ready: boolean; storageIssue: "unavailable" | "invalid" | null;
  reset: () => void; upload: (files: FileList | File[]) => Promise<string[]>; renameDocument: (id: string, title: string) => void; assignDocument: (id: string, collectionId: string) => void; deleteDocument: (id: string) => void;
  addCollection: (name: string, description: string) => string; editCollection: (id: string, name: string, description: string) => void;
  newConversation: () => string; ask: (conversationId: string, question: string, selectedIds: string[]) => void;
  addWorkflow: () => string; saveWorkflow: (workflow: Workflow) => void; deleteWorkflow: (id: string) => void; duplicateWorkflow: (id: string) => void; runWorkflow: (workflowId: string, documentId: string) => WorkflowRun | null;
  setMemberRole: (id: string, role: Member["role"]) => void; inviteMember: (email: string, role: Member["role"]) => void;
  updateSettings: (changes: Partial<Pick<WorkspaceState, "workspace" | "name" | "email" | "notifications">>) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
const now = () => new Date().toISOString();
const id = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const activity = (type: Activity["type"], text: string): Activity => ({ id: id(), type, text, at: now() });

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(initialState);
  const [ready, setReady] = useState(false);
  const [storageIssue, setStorageIssue] = useState<"unavailable" | "invalid" | null>(null);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (validSavedState(parsed)) setState(parsed);
          else setStorageIssue("invalid");
        }
      } catch (error) { setStorageIssue(error instanceof SyntaxError ? "invalid" : "unavailable"); }
      setReady(true);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!ready || storageIssue) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { queueMicrotask(() => setStorageIssue("unavailable")); }
  }, [state, ready, storageIssue]);
  const reset = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); setStorageIssue(null); }
    catch { setStorageIssue("unavailable"); }
    setState(initialState());
  }, []);
  const upload = useCallback(async (files: FileList | File[]) => {
    const errors: string[] = [];
    const newDocs: Doc[] = [];
    for (const file of Array.from(files)) {
      const result = documentType(file);
      if ("error" in result) { errors.push(`${file.name}: ${result.error}`); continue; }
      try {
        const text = result.status === "Ready" ? await file.text() : "";
        newDocs.push({ id: id(), title: file.name.replace(/\.[^.]+$/, ""), kind: result.kind, size: file.size, date: new Date().toISOString().slice(0, 10), owner: state.name, collectionId: state.collections[0]?.id ?? "product", status: result.status, text, tags: [], seeded: false });
      } catch { errors.push(`${file.name}: The file could not be read.`); }
    }
    if (newDocs.length) setState(s => ({ ...s, documents: [...newDocs, ...s.documents], activity: [activity("document", `${s.name} added ${newDocs.length} local document${newDocs.length === 1 ? "" : "s"}`), ...s.activity] }));
    return errors;
  }, [state.name, state.collections]);
  const renameDocument = useCallback((docId: string, title: string) => setState(s => ({ ...s, documents: s.documents.map(d => d.id === docId ? { ...d, title: title.trim() } : d) })), []);
  const assignDocument = useCallback((docId: string, collectionId: string) => setState(s => ({ ...s, documents: s.documents.map(d => d.id === docId ? { ...d, collectionId } : d) })), []);
  const deleteDocument = useCallback((docId: string) => setState(s => ({ ...s, documents: s.documents.filter(d => d.id !== docId), activity: [activity("document", "A document was removed from the local demo"), ...s.activity] })), []);
  const addCollection = useCallback((name: string, description: string) => { const collectionId = id(); setState(s => ({ ...s, collections: [...s.collections, { id: collectionId, name: name.trim(), description: description.trim(), color: "teal" }] })); return collectionId; }, []);
  const editCollection = useCallback((collectionId: string, name: string, description: string) => setState(s => ({ ...s, collections: s.collections.map(c => c.id === collectionId ? { ...c, name: name.trim(), description: description.trim() } : c) })), []);
  const newConversation = useCallback(() => { const conversationId = id(); setState(s => ({ ...s, conversations: [{ id: conversationId, title: "New conversation", messages: [], updatedAt: now() }, ...s.conversations] })); return conversationId; }, []);
  const ask = useCallback((conversationId: string, question: string, selectedIds: string[]) => {
    const result = sampleAnswer(question, selectedIds.length ? selectedIds : state.documents.map(d => d.id), state.documents);
    const time = now();
    const user: Message = { id: id(), role: "user", text: question.trim(), createdAt: time };
    const assistant: Message = { id: id(), role: "assistant", text: result.text, citations: result.citations, sample: true, createdAt: time };
    setState(s => ({ ...s, conversations: s.conversations.map(c => c.id === conversationId ? { ...c, title: c.messages.length ? c.title : question.trim().slice(0, 48), messages: [...c.messages, user, assistant], updatedAt: time } : c), activity: [activity("chat", `${s.name} explored a sample answer`), ...s.activity] }));
  }, [state.documents]);
  const addWorkflow = useCallback(() => { const workflowId = id(); setState(s => ({ ...s, workflows: [{ id: workflowId, name: "Untitled workflow", enabled: false, steps: ["document-added", "summarize"] }, ...s.workflows] })); return workflowId; }, []);
  const saveWorkflow = useCallback((workflow: Workflow) => setState(s => ({ ...s, workflows: s.workflows.map(w => w.id === workflow.id ? workflow : w) })), []);
  const deleteWorkflow = useCallback((workflowId: string) => setState(s => ({ ...s, workflows: s.workflows.filter(w => w.id !== workflowId) })), []);
  const duplicateWorkflow = useCallback((workflowId: string) => setState(s => { const w = s.workflows.find(item => item.id === workflowId); return w ? { ...s, workflows: [{ ...w, id: id(), name: `${w.name} copy`, enabled: false, lastRun: undefined, steps: [...w.steps] }, ...s.workflows] } : s; }), []);
  const runWorkflow = useCallback((workflowId: string, documentId: string) => {
    const workflow = state.workflows.find(w => w.id === workflowId);
    const document = state.documents.find(d => d.id === documentId);
    if (!workflow || !document) return null;
    const error = validateWorkflow(workflow);
    const output = sampleWorkflowOutput(document);
    const run: WorkflowRun = { id: id(), workflowId, documentId, at: now(), status: error || !output ? "Failed" : "Completed", summary: output?.summary ?? "", actions: workflow.steps.includes("extract-actions") ? output?.actions ?? [] : [], error: error ?? (!output ? "No curated sample output exists for this document. Choose Project Atlas handover, Launch readiness checklist, or Customer interview synthesis, then retry." : undefined) };
    setState(s => {
      const noteText = `${run.summary}${run.actions.length ? `\n\nAction items:\n${run.actions.map(a => `- ${a}`).join("\n")}` : ""}`;
      const note: Doc | null = run.status === "Completed" && workflow.steps.includes("workspace-note") ? { id: id(), title: `Sample note · ${document.title}`, kind: "MD", size: noteText.length * 2, date: new Date().toISOString().slice(0, 10), owner: s.name, collectionId: document.collectionId, status: "Ready", text: noteText, tags: ["workflow", "sample"], seeded: false } : null;
      return { ...s, documents: note ? [note, ...s.documents] : s.documents, runs: [run, ...s.runs], workflows: s.workflows.map(w => w.id === workflowId && run.status === "Completed" ? { ...w, lastRun: run.at } : w), activity: [activity("workflow", `${workflow.name}: sample run ${run.status.toLowerCase()}${note ? " and added a local note" : ""}`), ...s.activity] };
    });
    return run;
  }, [state.workflows, state.documents]);
  const setMemberRole = useCallback((memberId: string, role: Member["role"]) => setState(s => ({ ...s, members: s.members.map(m => m.id === memberId ? { ...m, role } : m) })), []);
  const inviteMember = useCallback((email: string, role: Member["role"]) => setState(s => ({ ...s, members: [...s.members, { id: id(), name: email.split("@")[0], email, role, initials: email.slice(0, 2).toUpperCase(), color: "teal" }], activity: [activity("team", `Simulated invitation for ${email}; no email sent`), ...s.activity] })), []);
  const updateSettings = useCallback((changes: Partial<Pick<WorkspaceState, "workspace" | "name" | "email" | "notifications">>) => setState(s => ({ ...s, ...changes })), []);
  const value = useMemo(() => ({ state, ready, storageIssue, reset, upload, renameDocument, assignDocument, deleteDocument, addCollection, editCollection, newConversation, ask, addWorkflow, saveWorkflow, deleteWorkflow, duplicateWorkflow, runWorkflow, setMemberRole, inviteMember, updateSettings }), [state, ready, storageIssue, reset, upload, renameDocument, assignDocument, deleteDocument, addCollection, editCollection, newConversation, ask, addWorkflow, saveWorkflow, deleteWorkflow, duplicateWorkflow, runWorkflow, setMemberRole, inviteMember, updateSettings]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
export function useWorkspace() { const context = useContext(WorkspaceContext); if (!context) throw new Error("WorkspaceProvider is required"); return context; }
