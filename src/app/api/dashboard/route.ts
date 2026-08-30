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
  effectiveStatus,
  sourceOf,
} from "@/lib/priority";
import { MEMBERS } from "@/lib/members";
import { FIRM_TABLE, FIRMS, type FirmSlug } from "@/lib/partners";

export const dynamic = "force-dynamic";

/** 설계팀 대시보드 데이터: 우선순위 미배정/신규 + 협력사 미배정/신규 */
export async function GET() {
  try {
    const [cRes, eRes, aRes] = await Promise.all([
      getContracts(),
      getEContractsLite(),
      getDesignAssignees(),
    ]);
    const map = buildAssigneeMap(aRes.data);
    const memberNames = new Set(MEMBERS.map((m) => m.name));

    const queue = buildDesignQueue(cRes.data, eRes.data, map).filter((c) => {
      const a = effectiveAssignee(c);
      return !a || !memberNames.has(a);
    });
    const unassigned = queue.filter((c) => effectiveAssignee(c) === null);

    const priority = {
      unassigned: unassigned.length,
      ts: unassigned
        .map((c) => (c.created_at as string | null) ?? c.contract_date ?? null)
        .filter((v): v is string => Boolean(v)),
      items: unassigned.slice(0, 10).map((c) => {
        const rec = c as unknown as Record<string, unknown>;
        const href =
          (rec._href as string | undefined) ??
          (c.local_id
            ? `/contracts/${encodeURIComponent(c.local_id)}`
            : null);
        return {
          key: (rec._key as string) ?? String(c.id),
          customer: c.customer_name ?? "-",
          model: c.model_name ?? "",
          date: c.contract_date ?? "",
          status: effectiveStatus(c),
          eco: sourceOf(c) === "econtract",
          href,
        };
      }),
    };

    const firmData = await Promise.all(
      (Object.entries(FIRM_TABLE) as [FirmSlug, string][]).map(
        async ([slug, table]) => {
          const res = await getPartnerSubmissions(table);
          const rows = res.data;
          const un = rows.filter(
            (s) => !s.assignee || !String(s.assignee).trim(),
          );
          return [
            slug,
            {
              name: FIRMS[slug].name,
              slug,
              unassigned: un.length,
              total: rows.length,
              ts: rows
                .map((s) => s.uploaded_at)
                .filter((v): v is string => Boolean(v)),
              items: rows.slice(0, 5).map((s) => ({
                id: s.id,
                title: s.title ?? s.file_name ?? "(제목 없음)",
                by: s.uploaded_by_name ?? "",
                at: s.uploaded_at ?? "",
                url: s.file_url ?? "",
                assigned: Boolean(s.assignee && String(s.assignee).trim()),
              })),
            },
          ] as const;
        },
      ),
    );

    return NextResponse.json({
      priority,
      partners: Object.fromEntries(firmData),
    });
  } catch {
    return NextResponse.json({});
  }
}
