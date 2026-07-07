"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/lib/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function Sidebar({
  userName,
  userEmail,
  userTeam,
}: {
  userName?: string | null;
  userEmail?: string | null;
  userTeam?: string | null;
}) {
  const pathname = usePathname();
  const displayName = userName?.trim() || "세움 설계팀";
  const initial = displayName.charAt(0);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* 로고 */}
      <div className="flex items-center gap-2.5 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-base font-bold text-white">
          세움
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-900">Plan OS</p>
          <p className="text-[11px] text-slate-400">설계팀 전용 워크스페이스</p>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-2">
        {navSections.map((section, i) => (
          <div key={section.title ?? `section-${i}`} className="space-y-1">
            {section.title && (
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-brand-50 font-semibold text-brand-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <svg
                    className={`h-5 w-5 shrink-0 ${
                      active
                        ? "text-brand-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.7}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={item.icon}
                    />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* 하단 사용자 영역 */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {initial}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-slate-800">
              {displayName}
              {userTeam ? (
                <span className="ml-1 text-[11px] font-normal text-slate-400">
                  {userTeam}
                </span>
              ) : null}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              {userEmail ?? "team@seum.kr"}
            </p>
          </div>
          {userEmail ? <LogoutButton /> : null}
        </div>
      </div>
    </aside>
  );
}
