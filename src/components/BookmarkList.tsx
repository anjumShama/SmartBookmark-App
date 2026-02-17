"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  created_at: string;
};

export default function BookmarkList({
  userId,
  initialBookmarks,
}: {
  userId: string;
  initialBookmarks: Bookmark[];
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => {
              // Avoid duplicate if already present
              if (prev.some((b) => b.id === (payload.new as Bookmark).id)) {
                return prev;
              }
              return [payload.new as Bookmark, ...prev];
            });
          } else if (payload.eventType === "DELETE") {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("bookmarks").delete().eq("id", id);
    setDeletingId(null);
  };

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📑</div>
        <p className="text-white/60 text-lg">No bookmarks yet.</p>
        <p className="text-white/40 text-sm mt-1">
          Add your first bookmark above!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
        >
          <div className="min-w-0 flex-1">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-medium hover:text-purple-300 transition-colors truncate block"
            >
              {bookmark.title}
            </a>
            <p className="text-white/40 text-sm truncate mt-0.5">
              {bookmark.url}
            </p>
          </div>
          <button
            onClick={() => handleDelete(bookmark.id)}
            disabled={deletingId === bookmark.id}
            className="ml-4 p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 cursor-pointer"
            title="Delete bookmark"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
