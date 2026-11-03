"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alfa_Slab_One, Schibsted_Grotesk } from "next/font/google";
import { useAuth } from "@/hooks/useAuth";
import Forme from "@/components/landing/Forme";
import "./forme.css";

const wood = Alfa_Slab_One({ weight: "400", subsets: ["latin"], variable: "--font-wood", display: "swap" });
const grotesk = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });

const IN_THE_EDITOR = [
  {
    title: "Blocks you can move",
    body: "Drag any paragraph, list, table or code block to a new place on the page.",
  },
  {
    title: "Pages inside pages",
    body: "Nest pages, mark favourites, add tags, and restore anything from the trash.",
  },
  {
    title: "Code and maths",
    body: "Syntax-highlighted code blocks and KaTeX equations sit in the text like any other block.",
  },
  {
    title: "An outline that builds itself",
    body: "Headings become a table of contents beside the page, so long notes stay navigable.",
  },
];

/** A type slug: a block of metal type with the letter N cut out of it. */
function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label="NotionCraft" className={className}>
      <rect x="1" y="1" width="30" height="30" rx="2" fill="#f7f7f2" />
      <path d="M9 24V8h3.2l7.6 10.4V8H23v16h-3.2L12.2 13.6V24z" fill="#1d36c9" />
    </svg>
  );
}

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/workspace");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={`forme ${wood.variable} ${grotesk.variable} forme-body flex items-center justify-center`}>
        <p role="status">Loading</p>
      </div>
    );
  }

  return (
    <div className={`forme ${wood.variable} ${grotesk.variable} forme-body`}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Mark className="h-9 w-9" />
          <span className="hidden text-lg font-semibold sm:inline">NotionCraft AI</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => router.push("/auth")}
            className="hidden px-3 py-2 text-base underline-offset-4 hover:underline sm:inline-block"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => router.push("/auth")}
            className="rounded-sm bg-[var(--forme-type)] px-4 py-2 text-base font-semibold text-[var(--forme-iron)] hover:bg-white"
          >
            Start writing
          </button>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
          <h1 className="forme-display max-w-4xl text-[2.75rem] sm:text-6xl lg:text-[5.5rem]">
            The assistant writes in the page, not in a chat tab.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--forme-type-dim)]">
            NotionCraft AI is a block editor where you can ask for a summary, a checklist or a
            tighter sentence, and it sets the line right where you are working. You accept it or
            strike it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="rounded-sm bg-[var(--forme-type)] px-6 py-3 text-lg font-semibold text-[var(--forme-iron)] hover:bg-white"
            >
              Start writing
            </button>
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="rounded-sm border border-[var(--forme-type-dim)] px-6 py-3 text-lg font-semibold hover:bg-white/10"
            >
              Sign in
            </button>
          </div>

          <div className="mt-12 max-w-4xl">
            <Forme />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6" aria-labelledby="in-the-editor">
          <h2 id="in-the-editor" className="forme-display text-3xl sm:text-5xl">
            What is in the editor
          </h2>
          <dl className="mt-8 grid max-w-4xl gap-x-12 gap-y-8 sm:grid-cols-2">
            {IN_THE_EDITOR.map((item) => (
              <div key={item.title}>
                <dt className="text-xl font-semibold">{item.title}</dt>
                <dd className="mt-1 max-w-sm text-[var(--forme-type-dim)] leading-relaxed">{item.body}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <p className="text-sm text-[var(--forme-type-dim)]">
          Built by Ahmad Kanaan. Next.js, Tiptap and Supabase.{" "}
          <a
            className="underline underline-offset-4 hover:text-white"
            href="https://github.com/Haruru0-0/notioncraft-ai"
          >
            Source on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
