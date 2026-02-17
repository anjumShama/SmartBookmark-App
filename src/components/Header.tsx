"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function Header({ user }: { user: User }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Smart Bookmark
        </h1>
        <p className="text-white/50 text-sm mt-0.5">
          {user.user_metadata?.full_name || user.email}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-sm text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-all cursor-pointer"
      >
        Sign out
      </button>
    </header>
  );
}
