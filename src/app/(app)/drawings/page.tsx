import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getDrawings, getContractShowrooms } from "@/lib/data";
import { showroomOf } from "@/lib/priority";
import type { Contract } from "@/types";
import DrawingsView from "./DrawingsView";

export const dynamic = "force-dynamic";

export default async function DrawingsPage() {
  const [res, csRes] = await Promise.all([
    getDrawings(),
    getContractShowrooms(),
  ]);

  // local_id → 전시장(정규화) 매핑
  const showroomByLocalId = new Map<string, string>();
  for (const c of csRes.data) {
    if (c.local_id) {
      showroomByLocalId.set(
        c.local_id,
        showroomOf({ showroom_id: c.showroom_id } as unknown as Contract),
      );
    }
  }

  const drawings = res.data.map((d) => ({
    ...d,
    showroom: d.contract_local_id
      ? showroomByLocalId.get(d.contract_local_id) ?? ""
      : "",
  }));

  return (
    <>
      <PageHeader
        title="도면"
        description="계약별 도면입니다. 전시장·종류로 분류하고 파일을 바로 열 수 있습니다."
      />
      <ConnectionNotice configured={res.configured} error={res.error} />
      <DrawingsView drawings={drawings} />
    </>
  );
}
