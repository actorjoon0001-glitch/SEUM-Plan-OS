"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // AppShell 이 onAuthStateChange 로 감지해 로그인 화면으로 전환한다.
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
    >
      {loading ? "..." : "로그아웃"}
    </button>
  );
}
