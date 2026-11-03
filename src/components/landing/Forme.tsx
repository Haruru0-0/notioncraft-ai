"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Lock, X } from "lucide-react";

type Phase = "original" | "typing" | "pending" | "accepted";

interface Action {
  label: string;
  text: string;
}

const HEADING = "Reading list, third quarter";
const PLAIN_LINES = [
  "Finish the compilers book by the end of August.",
  "Pick one systems talk per week and write down the question it left me with.",
];
const TARGET =
  "i think we should maybe look at the storage paper again, it is long but it has alot of good ideas about logs";

// The same actions the editor's Assistant menu offers on selected text
const ACTIONS: Action[] = [
  { label: "Improve writing", text: "The storage paper is long, but its ideas about logs are worth a second read." },
  { label: "Make shorter", text: "Reread the storage paper: it has good ideas about logs." },
  { label: "Fix grammar", text: "I think we should look at the storage paper again. It is long, but it has a lot of good ideas about logs." },
];

const TYPE_MS = 18;

export default function Forme() {
  const [phase, setPhase] = useState<Phase>("original");
  const [full, setFull] = useState("");
  const [shown, setShown] = useState(0);
  const [announce, setAnnounce] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const run = (action: Action) => {
    if (phase === "typing" || phase === "pending") return;
    setFull(action.text);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(action.text.length);
      setPhase("pending");
      setAnnounce("The assistant rewrote the line. Accept or reject it.");
      return;
    }
    setShown(0);
    setPhase("typing");
    let n = 0;
    timer.current = setInterval(() => {
      n += 1;
      if (n >= action.text.length) {
        if (timer.current) clearInterval(timer.current);
        setShown(action.text.length);
        setPhase("pending");
        setAnnounce("The assistant rewrote the line. Accept or reject it.");
      } else {
        setShown(n);
      }
    }, TYPE_MS);
  };

  const accept = () => {
    setPhase("accepted");
    setAnnounce("Rewrite accepted.");
  };

  // Rejecting puts the original text back, exactly as the editor does
  const reject = () => {
    setPhase("original");
    setAnnounce("Rewrite rejected. Original text restored.");
  };

  const busy = phase === "typing" || phase === "pending";
  const showRewrite = phase !== "original";

  return (
    <div className="forme-chase">
      <div className="forme-bed px-3 py-4 sm:px-5 sm:py-6 min-h-[18rem]">
        <p className="forme-line font-semibold text-xl sm:text-2xl mb-2">{HEADING}</p>
        <p className="forme-line">{PLAIN_LINES[0]}</p>

        <div className="my-2 flex flex-wrap items-start gap-2">
          {showRewrite ? (
            <p
              className={`forme-line forme-slug flex-1 min-w-[12rem] ${phase === "typing" ? "forme-caret" : ""}`}
              aria-live="off"
            >
              {phase === "pending" && (
                <span aria-hidden className="font-mono mr-1">[</span>
              )}
              {full.slice(0, shown)}
              {phase === "pending" && (
                <span aria-hidden className="font-mono ml-1">]</span>
              )}
              {phase === "accepted" && (
                <Lock aria-label="Accepted" className="inline h-3.5 w-3.5 ml-2 -mt-0.5" />
              )}
            </p>
          ) : (
            <p className="forme-line flex-1 min-w-[12rem]">{TARGET}</p>
          )}
          {phase === "pending" && (
            <span className="flex gap-1.5 pt-1">
              <button
                type="button"
                onClick={accept}
                className="inline-flex items-center gap-1 rounded-sm bg-[var(--forme-type)] px-2.5 py-1 text-sm font-medium text-[var(--forme-iron)] hover:bg-white"
              >
                <Check className="h-4 w-4" aria-hidden /> Accept
              </button>
              <button
                type="button"
                onClick={reject}
                className="inline-flex items-center gap-1 rounded-sm border border-[var(--forme-type-dim)] px-2.5 py-1 text-sm font-medium text-[var(--forme-type)] hover:bg-white/10"
              >
                <X className="h-4 w-4" aria-hidden /> Reject
              </button>
            </span>
          )}
        </div>

        <p className="forme-line">{PLAIN_LINES[1]}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Ask the assistant to rewrite the highlighted line">
        <span className="forme-body mr-1 text-sm text-[var(--forme-type-dim)]">Rewrite the third line:</span>
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            disabled={busy || phase === "accepted"}
            onClick={() => run(a)}
            className="forme-body rounded-sm bg-[var(--forme-type)] px-3 py-1.5 text-sm font-medium text-[var(--forme-iron)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            {a.label}
          </button>
        ))}
        {phase === "accepted" && (
          <button
            type="button"
            onClick={() => setPhase("original")}
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
