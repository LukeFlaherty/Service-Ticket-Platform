"use client";

import { useState, useTransition, useRef } from "react";
import { addComment } from "@/server/actions/tickets";
import { formatDateTime } from "@/lib/utils";
import { Send } from "lucide-react";

type Comment = {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  isInternal: string | null;
  createdAt: Date;
};

export function CommentThread({
  ticketId,
  comments,
  currentUserName,
}: {
  ticketId: string;
  comments: Comment[];
  currentUserName: string;
}) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<Comment[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const allComments = [...comments, ...optimistic];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    const temp: Comment = {
      id: `optimistic-${Date.now()}`,
      body: trimmed,
      authorId: "",
      authorName: currentUserName,
      isInternal: null,
      createdAt: new Date(),
    };

    setOptimistic((prev) => [...prev, temp]);
    setBody("");

    startTransition(async () => {
      await addComment({ ticketId, body: trimmed });
      setOptimistic([]);
    });
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="px-5 py-4 border-b">
        <h2 className="font-medium text-sm">
          Comments{allComments.length > 0 && <span className="ml-1.5 text-zinc-400">({allComments.length})</span>}
        </h2>
      </div>

      {allComments.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-zinc-400">
          No comments yet. Be the first to add one.
        </div>
      ) : (
        <ul className="divide-y">
          {allComments.map((c) => (
            <li key={c.id} className="px-5 py-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600 shrink-0">
                  {c.authorName[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium">{c.authorName}</span>
                <span className="text-xs text-zinc-400">{formatDateTime(c.createdAt)}</span>
              </div>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap pl-8">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t px-5 py-4">
        <form ref={formRef} onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            className="flex-1 resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 placeholder-zinc-400"
          />
          <button
            type="submit"
            disabled={pending || !body.trim()}
            className="self-end flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            {pending ? "Sending…" : "Send"}
          </button>
        </form>
        <p className="mt-1.5 text-xs text-zinc-400">⌘↵ to submit</p>
      </div>
    </div>
  );
}
