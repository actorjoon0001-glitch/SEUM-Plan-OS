"use client";

import { useUser } from "@/components/UserContext";
import LogoutButton from "@/components/LogoutButton";

/**
 * 현재 로그인한 사용자 표시 배지.
 * 공용 PC 에서 누가 로그인해 작업 중인지 명확히 보여주고, 계정 전환(로그아웃)을 제공한다.
 */
export default function CurrentUserBadge() {
  const { session, employee } = useUser();
  if (!session) return null;

  const name = employee?.name?.trim() || session.user.email || "사용자";
  const sub = [employee?.team, employee?.position_name]
    .map((v) => v?.trim())
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          {name.charAt(0)}
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-800">
            {name}
            {sub ? (
              <span className="ml-1.5 text-xs font-normal text-slate-500">
                {sub}
              </span>
            ) : null}
          </p>
          <p className="text-[11px] text-slate-400">
            로그인됨 · {session.user.email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-slate-500 sm:inline">
          본인 계정이 아니면 →
        </span>
        <LogoutButton />
      </div>
    </div>
  );
}
