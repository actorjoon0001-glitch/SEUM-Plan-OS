"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type");

  // 설계팀 우선순위: 담당자 미지정 건수 배지
  const [pending, setPending] = useState<number | null>(null);
  // 외부 건축 협력사: 슬러그별 미지정(신규) 자료 건수
  const [partnerCounts, setPartnerCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    let alive = true;
    fetch("/api/priority-count")
      .then((r) => r.json())
      .then((d) => {
        if (alive && typeof d?.count === "number") setPending(d.count);
      })
      .catch(() => {});
    fetch("/api/partner-counts")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d && typeof d === "object") setPartnerCounts(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname]);

  // nav href → 배지 숫자 (0/미정이면 숨김)
  function badgeCount(href: string): number | null {
    if (href === "/priority") return pending;
    const m = href.match(/^\/partners\/([a-z]+)$/);
    if (m && partnerCounts[m[1]] != null) return partnerCounts[m[1]];
    return null;
  }
  const displayName = userName?.trim() || "세움 설계팀";
  const initial = displayName.charAt(0);

  function isActive(href: string): boolean {
    const [path, qs] = href.split("?");
    const wantType = new URLSearchParams(qs).get("type");
    if (path === "/") return pathname === "/";
    if (path === "/priority") {
      if (pathname !== "/priority") return false;
      return wantType ? currentType === wantType : !currentType;
    }
    return pathname === path || pathname.startsWith(path + "/");
  }

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
              const active = isActive(item.href);
              const base = item.highlight
                ? active
                  ? "bg-amber-100 font-bold text-amber-900 ring-1 ring-amber-300"
                  : "bg-amber-50 font-semibold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
                : active
                  ? "bg-brand-50 font-semibold text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900";
              const iconColor = item.highlight
                ? "text-amber-500"
                : active
                  ? "text-brand-600"
                  : "text-slate-400 group-hover:text-slate-600";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg py-2.5 text-sm transition-colors ${
                    item.indent ? "pl-11 pr-3" : "px-3"
                  } ${base}`}
                >
                  {item.indent ? (
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        active ? "bg-brand-500" : "bg-slate-300"
                      }`}
                    />
                  ) : (
                    <svg
                      className={`h-5 w-5 shrink-0 ${iconColor}`}
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
                  )}
                  <span className="flex-1">{item.label}</span>
                  {(() => {
                    const n = badgeCount(item.href);
                    return n != null && n > 0 ? (
                      <span
                        className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white"
                        title="담당자 미지정 · 신규 건수"
                      >
                        {n}
                      </span>
                    ) : null;
                  })()}
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
