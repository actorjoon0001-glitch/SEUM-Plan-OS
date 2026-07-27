import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getContracts } from "@/lib/data";
import { depositReceived } from "@/lib/priority";
import PriorityView from "./PriorityView";

export const dynamic = "force-dynamic";

export default async function PriorityPage() {
  const res = await getContracts();
  // 계약금 받은 건만 우선순위 큐에 표시
  const queue = res.data.filter(depositReceived);

  return (
    <>
      <PageHeader
        title="우선순위"
        description="건축허가 완료 후 설계 진행 우선순위 목록입니다. (계약금 수령 건 · 계약일 빠른 순)"
      />
      <ConnectionNotice configured={res.configured} error={res.error} />
      <PriorityView contracts={queue} />
    </>
  );
}
