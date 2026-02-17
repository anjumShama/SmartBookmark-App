import { createClient } from "@/lib/supabase/server";
import LoginButton from "@/components/LoginButton";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in — show landing page
  if (!user) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col items-center text-center max-w-md gap-6">

        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Smart Bookmark
        </h1>

        <p className="text-white/60 text-lg">
          Save, organize, and access your bookmarks from anywhere — in real-time.
        </p>

        {/* Centered login button */}
        <div className="flex justify-center">
          <LoginButton />
        </div>

        <p className="text-white/30 text-xs">
          Sign in with your Google account to get started.
        </p>

      </div>
    </main>
  );
}


  // Logged in — show dashboard
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <Header user={user} />
        <Dashboard userId={user.id} initialBookmarks={bookmarks || []} />
      </div>
    </main>
  );
}

