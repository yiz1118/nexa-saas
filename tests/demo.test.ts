import assert from "node:assert/strict";
import test from "node:test";
import { documentType, initialState, sampleAnswer, sampleWorkflowOutput, searchDocuments, seedDocuments, validSavedState, validateWorkflow } from "../lib/demo";

test("curated answers cite a passage that exists in the permitted source", () => {
  const result = sampleAnswer("What is blocking the Atlas release?", ["atlas-handover"], seedDocuments);
  assert.equal(result.citations.length, 1);
  const source = seedDocuments.find(d => d.id === result.citations[0].docId);
  assert.ok(source?.text.includes(result.citations[0].excerpt));
  assert.match(result.text, /accessibility review/i);
  const excluded = sampleAnswer("What is blocking the Atlas release?", ["support-runbook"], seedDocuments);
  assert.equal(excluded.citations.length, 0);
  assert.match(excluded.text, /no prepared answer/i);
});

test("uploaded text is eligible for local search while PDFs remain metadata only", () => {
  assert.deepEqual(documentType({ name: "notes.md", type: "text/markdown", size: 200 }), { kind: "MD", status: "Ready" });
  assert.deepEqual(documentType({ name: "brief.pdf", type: "application/pdf", size: 200 }), { kind: "PDF", status: "Metadata only" });
  assert.match(JSON.stringify(documentType({ name: "large.txt", type: "text/plain", size: 1048577 })), /1 MB/);
  assert.deepEqual(documentType({ name: "brief.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 10485760 }), { kind: "DOCX", status: "Metadata only" });
  assert.match(JSON.stringify(documentType({ name: "large.pdf", type: "application/pdf", size: 10485761 })), /10 MB/);
  assert.match(JSON.stringify(documentType({ name: "empty.md", type: "text/markdown", size: 0 })), /not empty/);
  assert.match(JSON.stringify(documentType({ name: "script.exe", type: "", size: 200 })), /Use a TXT/);
  assert.ok(searchDocuments(seedDocuments, "accessibility review").some(d => d.id === "atlas-handover"));
  assert.ok(!searchDocuments(seedDocuments, "accessibility review").some(d => d.id === "design-system"));
});

test("workflow validation and sample output keep unsupported sources explicit", () => {
  const state = initialState();
  assert.equal(validateWorkflow(state.workflows[0]), null);
  assert.match(validateWorkflow({ ...state.workflows[0], steps: ["document-added", "extract-actions"] }) ?? "", /Summarize/);
  assert.ok(sampleWorkflowOutput(seedDocuments[0])?.actions.length);
  assert.equal(sampleWorkflowOutput(seedDocuments.find(d => d.id === "design-system")!), null);
});

test("saved workspace requires the expected version and primary collections", () => {
  const state = initialState();
  assert.equal(validSavedState(state), true);
  assert.equal(validSavedState({ ...state, version: 2 }), false);
  assert.equal(validSavedState({ ...state, documents: [{ id: "bad", title: "Bad" }] }), false);
  assert.equal(validSavedState({ ...state, members: [{ ...state.members[0], role: "Unsupported role" }] }), false);
  assert.equal(validSavedState({ ...state, documents: [{ ...state.documents[0], size: -1 }] }), false);
  assert.equal(validSavedState({ ...state, conversations: [{ id: "bad", title: "Bad", updatedAt: "2026-09-28", messages: [{ id: "m", role: "assistant", text: "Bad", createdAt: "2026-09-28", citations: false }] }] }), false);
});
