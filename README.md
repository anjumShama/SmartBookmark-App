# Smart Bookmark App

This project was built as part of a technical assignment.  
It is a simple bookmark manager where users can log in with Google and manage their own private bookmarks.

---

# Features

- Google login (OAuth only)
- Add bookmarks (title and URL)
- Bookmarks are private to each user
- Real-time updates across multiple tabs
- Users can delete their own bookmarks

---
# Tech Stack

- Next.js (App Router)
- React
- Supabase (Authentication, Database, Realtime)
- Tailwind CSS

---

# Installation & Running Locally

Install dependencies
```bash
npm install

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

//Problems and solutions.

Realtime updates were not working across tabs 
  At first, changes were not updating in other open tabs.  
  I fixed this by enabling Supabase realtime and adding the required RLS policies.

Unnecessary files increasing project size  
  Local build and editor files were included at first.  
  I fixed this by using a proper `.gitignore` file .
