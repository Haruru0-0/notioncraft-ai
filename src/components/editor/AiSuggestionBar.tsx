'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import type { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { acceptSuggestion, getSuggestionIds, rejectSuggestion } from '@/lib/ai-edit';

/** Sits at the bottom of the editor while the assistant is writing or a suggestion awaits a decision. */
export function AiSuggestionBar({ editor, busy }: { editor: Editor; busy: boolean }) {
  const [ids, setIds] = useState<string[]>(() => getSuggestionIds(editor));

  useEffect(() => {
    const refresh = () => setIds(getSuggestionIds(editor));
    editor.on('transaction', refresh);
    return () => {
      editor.off('transaction', refresh);
    };
  }, [editor]);

  if (!busy && ids.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-14 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-lg border bg-popover px-3 py-2 text-sm shadow-lg"
    >
      <span aria-hidden className="h-3 w-3 shrink-0 rounded-[2px] bg-[var(--ai-ink)]" />
      {busy ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden />
          The assistant is writing
        </span>
      ) : (
        <>
          <span>{ids.length === 1 ? 'The assistant wrote this text.' : `The assistant wrote ${ids.length} passages.`}</span>
          <span className="flex gap-1.5">
            <Button
              size="sm"
              onClick={() => ids.forEach((id) => acceptSuggestion(editor, id))}
            >
              <Check className="mr-1 h-4 w-4" aria-hidden /> Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => ids.forEach((id) => rejectSuggestion(editor, id))}
            >
              <X className="mr-1 h-4 w-4" aria-hidden /> Reject
            </Button>
          </span>
        </>
      )}
    </div>
  );
}
