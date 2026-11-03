"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Lock, X } from "lucide-react";

type Author = "human" | "ai";
type Status = "set" | "pending" | "locked" | "rejected";

interface Line {
  id: number;
  text: string;
  author: Author;
  status: Status;
}

interface Prompt {
  label: string;
  text: string;
}

const HUMAN_LINES = [
  "Reading list, third quarter",
  "Finish the compilers book by the end of August.",
  "Notes on the paper about log-structured storage are still in the draft folder.",
  "Pick one systems talk per week and write down the question it left me with.",
];

const PROMPTS: Prompt[] = [
  {
    label: "Add a summary",
    text: "Summary: one book, one paper to write up, and a weekly talk with a written question.",
  },
  {
    label: "Make it a checklist",
    text: "[ ] Compilers book   [ ] Storage paper notes   [ ] One talk and one question, every week",
  },
  {
    label: "Tighten the last line",
    text: "Watch one systems talk a week and note the question it leaves.",
  },
];

const TYPE_MS = 18;

export default function Forme() {
  const [lines, setLines] = useState<Line[]>(() =>
    HUMAN_LINES.map((text, id) => ({ id, text, author: "human", status: "set" }))
  );
  const [typing, setTyping] = useState<{ id: number; shown: number; full: string } | null>(null);
  const [announce, setAnnounce] = useState("");
  const nextId = useRef(HUMAN_LINES.length);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const hasPending = lines.some((l) => l.status === "pending") || typing !== null;

  const setLine = useCallback((prompt: Prompt) => {
    if (hasPending) return;
    const id = nextId.current++;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setLines((prev) => [...prev, { id, text: prompt.text, author: "ai", status: "pending" }]);
      setAnnounce("The assistant set a line. Accept or reject it.");
      return;
    }

    setTyping({ id, shown: 0, full: prompt.text });
    let shown = 0;
    timer.current = setInterval(() => {
      shown += 1;
      if (shown >= prompt.text.length) {
        if (timer.current) clearInterval(timer.current);
        setTyping(null);
        setLines((prev) => [...prev, { id, text: prompt.text, author: "ai", status: "pending" }]);
        setAnnounce("The assistant set a line. Accept or reject it.");
      } else {
        setTyping({ id, shown, full: prompt.text });
      }
    }, TYPE_MS);
  }, [hasPending]);

  const resolve = (id: number, status: "locked" | "rejected") => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    setAnnounce(status === "locked" ? "Line accepted." : "Line rejected.");
  };

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setTyping(null);
    nextId.current = HUMAN_LINES.length;
    setLines(HUMAN_LINES.map((text, id) => ({ id, text, author: "human", status: "set" })));
    setAnnounce("Page reset.");
  };

  const hasAi = lines.some((l) => l.author === "ai");

  return (
    <div className="forme-chase">
      <div className="forme-bed px-3 py-4 sm:px-5 sm:py-6 min-h-[18rem]">
        <p className="forme-line font-semibold text-xl sm:text-2xl mb-2">{lines[0].text}</p>
        {lines.slice(1).map((line) => {
          if (line.author === "human") {
            return (
              <p key={line.id} className="forme-line">
                {line.text}
              </p>
            );
          }
          const struck = line.status === "rejected";
          return (
            <div key={line.id} className="my-2 flex flex-wrap items-start gap-2">
              <p
                className={`forme-line forme-slug flex-1 min-w-[12rem] ${struck ? "forme-slug-struck" : ""}`}
              >
                {line.status === "pending" && (
                  <span aria-hidden className="font-mono mr-1">[</span>
                )}
                {line.text}
                {line.status === "pending" && (
                  <span aria-hidden className="font-mono ml-1">]</span>
                )}
                {line.status === "locked" && (
                  <Lock aria-label="Accepted" className="inline h-3.5 w-3.5 ml-2 -mt-0.5" />
                )}
              </p>
              {line.status === "pending" && (
                <span className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => resolve(line.id, "locked")}
                    className="inline-flex items-center gap-1 rounded-sm bg-[var(--forme-type)] px-2.5 py-1 text-sm font-medium text-[var(--forme-iron)] hover:bg-white"
                  >
                    <Check className="h-4 w-4" aria-hidden /> Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => resolve(line.id, "rejected")}
                    className="inline-flex items-center gap-1 rounded-sm border border-[var(--forme-type-dim)] px-2.5 py-1 text-sm font-medium text-[var(--forme-type)] hover:bg-white/10"
                  >
                    <X className="h-4 w-4" aria-hidden /> Reject
                  </button>
                </span>
              )}
            </div>
          );
        })}
        {typing && (
          <p className="forme-line forme-slug forme-caret my-2" aria-hidden>
            {typing.full.slice(0, typing.shown)}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Ask the assistant">
        <span className="forme-body mr-1 text-sm text-[var(--forme-type-dim)]">Ask the assistant:</span>
        {PROMPTS.map((p) => (
          <button
            key={p.label}
            type="button"
            disabled={hasPending}
            onClick={() => setLine(p)}
            className="forme-body rounded-sm bg-[var(--forme-type)] px-3 py-1.5 text-sm font-medium text-[var(--forme-iron)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            {p.label}
          </button>
        ))}
        {hasAi && (
          <button
            type="button"
            onClick={reset}
            className="forme-body ml-auto rounded-sm px-2 py-1.5 text-sm text-[var(--forme-type-dim)] underline underline-offset-4 hover:text-white"
          >
            Reset page
          </button>
        )}
      </div>
      <p className="forme-body mt-2 text-xs text-[var(--forme-type-dim)]">
        Sample text. Nothing here is sent to a model; sign in to use the real assistant.
      </p>
      <p className="sr-only" aria-live="polite">{announce}</p>
    </div>
  );
}
