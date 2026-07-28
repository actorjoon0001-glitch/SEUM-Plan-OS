import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getContracts } from "@/lib/data";
import { type TabKey } from "@/lib/priority";
import PriorityView from "./PriorityView";

export const dynamic = "force-dynamic";

const VALID_TABS: TabKey[] = [
  "all",
  "urgent",
  "container",
  "stay",
  "house",
  "etc",
  "done",
];

export default async function PriorityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialTab: TabKey =
    type && VALID_TABS.includes(type as TabKey) ? (type as TabKey) : "all";

  const res = await getContracts();
  // 우선 전체 계약을 큐에 표시 (실제 계약금 컬럼 확인 후 '계약금 수령 건'만으로 재적용 예정)
  const queue = res.data;

  return (
    <>
      <PageHeader
        title="우선순위"
        description="설계 진행 우선순위 목록입니다. (계약일 빠른 순)"
      />
      <ConnectionNotice configured={res.configured} error={res.error} />
      <PriorityView key={initialTab} contracts={queue} initialTab={initialTab} />
    </>
  );
}
