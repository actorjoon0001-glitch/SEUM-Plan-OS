import { NextResponse } from "next/server";
import { getContracts, getEContractsLite, getDesignAssignees } from "@/lib/data";
import {
  buildAssigneeMap,
  buildDesignQueue,
  effectiveAssignee,
} from "@/lib/priority";

export const dynamic = "force-dynamic";

/** 설계팀 우선순위(배정 대기)에서 담당자 미지정 건수 */
export async function GET() {
  try {
    const [res, eres, ares] = await Promise.all([
      getContracts(),
      getEContractsLite(),
      getDesignAssignees(),
    ]);
    const map = buildAssigneeMap(ares.data);
    const queue = buildDesignQueue(res.data, eres.data, map);
    const count = queue.filter((c) => effectiveAssignee(c) === null).length;
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: null });
  }
}
