"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  created_at: string;
  user_id: string;
};

export default function Dashboard({
  userId,
  initialBookmarks,
}: {
  userId: string;
  initialBookmarks: Bookmark[];
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Real-time subscription for cross-tab sync
  useEffect(() => {
  const supabase = createClient();

  // 🔑 IMPORTANT: ensure auth session is loaded for realtime (cross-tab fix)
  supabase.auth.getSession().then(() => {
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
              if (prev.some((b) => b.id === payload.new.id)) return prev;
              return [payload.new as Bookmark, ...prev];
            });
          }

          if (payload.eventType === "DELETE") {
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
  });
}, [userId]);



  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !url.trim()) {
      setError("Both title and URL are required.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: insertError } = await supabase
      .from("bookmarks")
      .insert({
        title: title.trim(),
        url: url.trim(),
        user_id: userId,
      })
      .select()
      .single();

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data) {
      setBookmarks((prev) => {
        if (prev.some((b) => b.id === data.id)) return prev;
        return [data, ...prev];
      });
    }

    setTitle("");
    setUrl("");
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));

    const supabase = createClient();
    await supabase.from("bookmarks").delete().eq("id", id);
    setDeletingId(null);
  };

  return (
    <>
      {/* Add Bookmark Form */}
      <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
          Add Bookmark
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Bookmark title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            />
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      </div>

      {/* Bookmark List */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
          Your Bookmarks ({bookmarks.length})
        </h2>

        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📑</div>
            <p className="text-white/60 text-lg">No bookmarks yet.</p>
            <p className="text-white/40 text-sm mt-1">
              Add your first bookmark above!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
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

                {/* Delete Button – always visible */}
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  disabled={deletingId === bookmark.id}
                  className="ml-4 p-2 text-white/70 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
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
        )}
      </div>
    </>
  );
}
