"use client";

import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAiKey } from '@/hooks/useAiKey';

const messageOf = async (res: Response, fallback: string) => {
  const body = (await res.json().catch(() => null)) as { message?: string } | null;
  return body?.message || fallback;
};

/** Where a person saves, replaces or removes their own Gemini key. The server stores it encrypted and never sends it back. */
export function AiKeySection() {
  const { status, failed, refresh } = useAiKey();
  const [draft, setDraft] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/ai/key', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: draft.trim() }),
      });
      if (!res.ok) throw new Error(await messageOf(res, 'Could not save the key. Try again.'));
      setDraft('');
      toast.success('Key saved');
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save the key. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/ai/key', { method: 'DELETE' });
      if (!res.ok) throw new Error(await messageOf(res, 'Could not remove the key. Try again.'));
      toast.success('Key removed');
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not remove the key. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const saved = status?.hasKey ?? false;

  return (
    <form id="ai-key" onSubmit={save} className="scroll-mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">AI Assistant Key</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The assistant uses your own Google Gemini key, so the usage is billed to you. It is encrypted on the server and
            never shown again after you save it.
          </p>
        </div>

        <div data-animate-card className="md:col-span-2 bg-background rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-8 space-y-5">
            {failed && <p className="text-sm text-destructive">Could not load your key status. Refresh the page to try again.</p>}
            {!failed && !status && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading" />}
            {status && !status.canSave && (
              <p className="text-sm text-destructive">Saving keys is not set up on this server yet.</p>
            )}

            {status && (
              <>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Label htmlFor="geminiKey" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <KeyRound className="h-3.5 w-3.5" />
                      Gemini API key
                    </Label>
                    <p className="text-[13px] text-muted-foreground" aria-live="polite">
                      {saved
                        ? `Your key ending ${status.hint} is in use`
                        : status.sharedKey
                          ? 'Using the shared key'
                          : 'No key yet. The assistant needs one'}
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      id="geminiKey"
                      type={show ? 'text' : 'password'}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder={saved ? 'Paste a new key to replace it' : 'AIza...'}
                      value={draft}
                      disabled={!status.canSave || busy}
                      onChange={(e) => setDraft(e.target.value)}
                      className="h-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={show ? 'Hide key' : 'Show key'}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[13px] text-muted-foreground">
                    Get one free at{' '}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      aistudio.google.com/apikey
                    </a>
                    .
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={!status.canSave || busy || draft.trim().length === 0}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                    {saved ? 'Replace key' : 'Save key'}
                  </Button>
                  {saved && (
                    <Button type="button" variant="outline" onClick={remove} disabled={busy}>
                      Remove
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
