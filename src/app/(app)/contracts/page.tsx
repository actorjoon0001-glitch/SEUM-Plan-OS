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
        title="수기 계약서"
        description="기존 수기 계약 목록입니다. 설계 작업의 기준이 되며, 계약을 눌러 도면·인허가·소통을 한 곳에서 확인하세요. (전자계약서는 별도 메뉴)"
      />
      <ConnectionNotice configured={res.configured} error={res.error} />
      <ContractsView contracts={res.data} />
    </>
  );
}
