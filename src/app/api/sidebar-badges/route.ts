import { NextResponse } from "next/server";
import {
  getContracts,
  getEContractsLite,
  getDesignAssignees,
  getPartnerSubmissions,
} from "@/lib/data";
import {
  buildAssigneeMap,
  buildDesignQueue,
  effectiveAssignee,
} from "@/lib/priority";
import { FIRM_TABLE } from "@/lib/partners";

export const dynamic = "force-dynamic";

/**
 * 사이드바 배지 데이터.
 * key 별로 { unassigned, ts } 반환.
 *  - unassigned: 담당자 미배정 건수
 *  - ts: 각 항목의 등록 시각 목록 (클라이언트가 '신규(N)' 계산에 사용)
 */
export async function GET() {
  try {
    const [cRes, eRes, aRes] = await Promise.all([
      getContracts(),
      getEContractsLite(),
      getDesignAssignees(),
    ]);
    const map = buildAssigneeMap(aRes.data);
    const queue = buildDesignQueue(cRes.data, eRes.data, map);
    const priority = {
      unassigned: queue.filter((c) => effectiveAssignee(c) === null).length,
      ts: queue
        .map((c) => (c.created_at as string | null) ?? c.contract_date ?? null)
        .filter((v): v is string => Boolean(v)),
    };

    const firmEntries = await Promise.all(
      Object.entries(FIRM_TABLE).map(async ([slug, table]) => {
        const res = await getPartnerSubmissions(table);
        const rows = res.data;
        const unassigned = rows.filter(
          (s) => !s.assignee || !String(s.assignee).trim(),
        ).length;
        const ts = rows
          .map((s) => s.uploaded_at)
          .filter((v): v is string => Boolean(v));
        return [slug, { unassigned, ts }] as const;
      }),
    );

    return NextResponse.json({ priority, ...Object.fromEntries(firmEntries) });
  } catch {
    return NextResponse.json({});
  }
}
