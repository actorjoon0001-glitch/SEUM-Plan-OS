import { NextResponse } from "next/server";
import { getPartnerSubmissions } from "@/lib/data";
import { FIRM_TABLE } from "@/lib/partners";

export const dynamic = "force-dynamic";

/** 협력사별 담당자 미지정(=아직 처리 안 한 신규) 자료 건수 */
export async function GET() {
  try {
    const entries = Object.entries(FIRM_TABLE);
    const results = await Promise.all(
      entries.map(async ([slug, table]) => {
        const res = await getPartnerSubmissions(table);
        const count = res.data.filter(
          (s) => !s.assignee || !String(s.assignee).trim(),
        ).length;
        return [slug, count] as const;
      }),
    );
    return NextResponse.json(Object.fromEntries(results));
  } catch {
    return NextResponse.json({});
  }
}
