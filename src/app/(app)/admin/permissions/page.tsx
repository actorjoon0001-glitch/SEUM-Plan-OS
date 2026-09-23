"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useUser } from "@/components/UserContext";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/admin";
import { defaultTeamCanEdit } from "@/lib/permissions";

interface TeamRow {
  team: string;
  count: number;
}

export default function PermissionsPage() {
  const { session } = useUser();
  const admin = isAdmin(session?.user.email);

  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [savingTeam, setSavingTeam] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!admin) {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      const sb = createClient();
      const [empRes, permRes] = await Promise.all([
        sb.from("employees").select("team"),
        sb.from("plan_os_team_perms").select("team, can_edit"),
      ]);
      if (!alive) return;
      // 팀별 인원 집계
      const counts = new Map<string, number>();
      for (const r of (empRes.data ?? []) as { team: string | null }[]) {
        const t = r.team?.trim();
        if (!t) continue;
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
      const list = [...counts.entries()]
        .map(([team, count]) => ({ team, count }))
        .sort((a, b) => b.count - a.count);
      setTeams(list);
      const ov = new Map<string, boolean>();
      for (const r of (permRes.data ?? []) as {
        team: string;
        can_edit: boolean;
      }[]) {
        if (r.team) ov.set(r.team, !!r.can_edit);
      }
      setOverrides(ov);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [admin]);

  const effective = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const t of teams) {
      m.set(
        t.team,
        overrides.has(t.team)
          ? (overrides.get(t.team) as boolean)
          : defaultTeamCanEdit(t.team),
      );
    }
    return m;
  }, [teams, overrides]);

  async function setTeam(team: string, canEdit: boolean) {
    setSavingTeam(team);
    setError(null);
    // 낙관적 업데이트
    setOverrides((prev) => new Map(prev).set(team, canEdit));
    try {
      const sb = createClient();
      const { error } = await sb
        .from("plan_os_team_perms")
        .upsert({ team, can_edit: canEdit }, { onConflict: "team" });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingTeam(null);
    }
  }

  if (!admin) {
    return (
      <>
        <PageHeader title="권한 관리" description="관리자 전용 페이지입니다." />
        <Card className="p-8 text-center text-sm text-slate-500">
          이 페이지는 관리자만 접근할 수 있습니다.
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="권한 관리"
        description="팀별로 설계 데이터 수정 권한을 설정합니다. (설계담당·진행상태·메모·검토승인)"
      />

      <Card className="mb-4 p-4">
        <p className="text-sm text-slate-600">
          · <b>수정 허용</b> 팀만 설계담당·진행상태·메모·검토승인을 변경할 수
          있고, 나머지 팀은 <b>보기 전용</b> 입니다.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          기본값: <b>설계</b> 팀만 허용. 관리자는 설정과 무관하게 항상 수정
          가능합니다.
        </p>
      </Card>

      {error && (
        <Card className="mb-4 border-rose-200 bg-rose-50 p-4">
          <p className="text-sm text-rose-600">
            저장 실패: {error} (plan_os_team_perms 테이블/권한을 확인하세요.)
          </p>
        </Card>
      )}

      {loading ? (
        <Card className="p-10 text-center text-sm text-slate-400">
          불러오는 중…
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-5 py-3 font-medium">팀</th>
                <th className="px-5 py-3 font-medium">인원</th>
                <th className="px-5 py-3 font-medium">현재 권한</th>
                <th className="px-5 py-3 text-right font-medium">수정 허용</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teams.map((t) => {
                const can = effective.get(t.team) ?? false;
                const isDefault = !overrides.has(t.team);
                return (
                  <tr key={t.team}>
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {t.team}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{t.count}명</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          can
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                            : "bg-slate-100 text-slate-500 ring-1 ring-slate-300"
                        }`}
                      >
                        {can ? "수정 가능" : "보기 전용"}
                      </span>
                      {isDefault && (
                        <span className="ml-1.5 text-[11px] text-slate-400">
                          (기본)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        disabled={savingTeam === t.team}
                        onClick={() => setTeam(t.team, !can)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          can ? "bg-emerald-500" : "bg-slate-300"
                        } ${savingTeam === t.team ? "opacity-60" : ""}`}
                        title="수정 허용 전환"
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            can ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
