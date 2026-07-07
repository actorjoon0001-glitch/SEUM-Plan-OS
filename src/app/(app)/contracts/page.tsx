import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getContracts } from "@/lib/data";
import ContractsView from "./ContractsView";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const res = await getContracts();

  return (
    <>
      <PageHeader
        title="계약 · 프로젝트"
        description="설계팀이 진행하는 계약 목록입니다. 계약을 눌러 도면·인허가·소통을 한 곳에서 확인하세요."
      />
      <ConnectionNotice configured={res.configured} error={res.error} />
      <ContractsView contracts={res.data} />
    </>
  );
}
