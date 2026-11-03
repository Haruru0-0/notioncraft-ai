import type { Editor } from '@tiptap/react';

export type AiEditType = 'improve' | 'shorter' | 'longer' | 'grammar' | 'professional';

export const AI_EDIT_ACTIONS: { type: AiEditType; label: string; hint: string }[] = [
  { type: 'improve', label: 'Improve writing', hint: 'Clearer and tighter' },
  { type: 'shorter', label: 'Make shorter', hint: 'Keep the main points' },
  { type: 'longer', label: 'Make longer', hint: 'Add detail' },
  { type: 'grammar', label: 'Fix grammar', hint: 'Spelling and punctuation' },
  { type: 'professional', label: 'Professional tone', hint: 'Formal wording' },
];

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const withBreaks = (s: string) => escapeHtml(s).replace(/\r?\n/g, '<br>');

function suggestionHtml(text: string, id: string, original: string) {
  return `<span data-ai-id="${id}" data-ai-original="${escapeHtml(original)}">${withBreaks(text)}</span>`;
}

/** The extent of one suggestion in the document, or null when it is gone. */
function findSuggestion(editor: Editor, id: string) {
  const type = editor.schema.marks.aiSuggestion;
  let from = -1;
  let to = -1;
  let original = '';
  editor.state.doc.descendants((node, pos) => {
    if (!node.isInline) return;
    const mark = node.marks.find((m) => m.type === type && m.attrs.id === id);
    if (!mark) return;
    if (from === -1) from = pos;
    to = pos + node.nodeSize;
    original = mark.attrs.original ?? '';
  });
  return from === -1 ? null : { from, to, original };
}

/** Ids of every suggestion still waiting for a decision. */
export function getSuggestionIds(editor: Editor): string[] {
  const type = editor.schema.marks.aiSuggestion;
  const ids = new Set<string>();
  editor.state.doc.descendants((node) => {
    node.marks.forEach((m) => {
      if (m.type === type && m.attrs.id) ids.add(m.attrs.id);
    });
  });
  return [...ids];
}

/** Ask the assistant to rewrite the selected text. The result replaces it, marked as a suggestion. */
export async function requestAiEdit(editor: Editor, type: AiEditType): Promise<void> {
  const { from, to, $from, $to } = editor.state.selection;
  if (from === to || !$from.sameParent($to)) {
    throw new Error('Select some text inside one paragraph first.');
  }
  const original = editor.state.doc.textBetween(from, to, '\n');

  const res = await fetch('/api/ai/writer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: original, type }),
  });
  if (!res.ok) {
    throw new Error(res.status === 429 ? 'The assistant is busy. Try again in a minute.' : 'The assistant could not answer. Try again.');
  }
  const text = (await res.text()).trim();
  if (!text) throw new Error('The assistant sent back nothing. Try again.');

  // The selection may have moved or changed while we waited
  if (editor.state.doc.textBetween(from, to, '\n') !== original) {
    throw new Error('The text changed while the assistant was writing, so nothing was replaced.');
  }

  editor.chain().focus().insertContentAt({ from, to }, suggestionHtml(text, crypto.randomUUID(), original)).run();
}

/** Put assistant text at the cursor (used by the chat panel's Insert button). */
export function insertAiText(editor: Editor, text: string) {
  editor.chain().focus().insertContent(suggestionHtml(text.trim(), crypto.randomUUID(), '')).run();
}

export function acceptSuggestion(editor: Editor, id: string) {
  const found = findSuggestion(editor, id);
  if (!found) return;
  const tr = editor.state.tr.removeMark(found.from, found.to, editor.schema.marks.aiSuggestion);
  editor.view.dispatch(tr);
}

export function rejectSuggestion(editor: Editor, id: string) {
  const found = findSuggestion(editor, id);
  if (!found) return;
  const range = { from: found.from, to: found.to };
  if (found.original) {
    editor.chain().focus().insertContentAt(range, withBreaks(found.original)).run();
  } else {
    editor.chain().focus().deleteRange(range).run();
  }
}
