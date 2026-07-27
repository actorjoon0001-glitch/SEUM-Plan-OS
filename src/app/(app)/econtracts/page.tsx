import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import CurrentUserBadge from "@/components/CurrentUserBadge";
import { getEContracts } from "@/lib/data";
import { isCompletedEContract } from "@/lib/econtract";
import EContractsView from "./EContractsView";

export const dynamic = "force-dynamic";

export default async function EContractsPage() {
  const res = await getEContracts();
  // 계약완료된 건만 표시
  const completed = res.data.filter(isCompletedEContract);

  return (
    <>
      <CurrentUserBadge />
      <PageHeader
        title="전자계약서"
        description="계약완료된 전자계약서 목록입니다. 현장 주소·계약 금액 등 설계에 필요한 정보를 확인하세요."
      />
      <ConnectionNotice configured={res.configured} error={res.error} />
      <EContractsView econtracts={completed} />
    </>
  );
}
