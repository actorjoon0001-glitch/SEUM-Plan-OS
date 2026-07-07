import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getDrawings } from "@/lib/data";
import DrawingsView from "./DrawingsView";

export const dynamic = "force-dynamic";

export default async function DrawingsPage() {
  const res = await getDrawings();

  return (
    <>
      <PageHeader
        title="도면"
        description="계약별 도면입니다. 종류(3D 등) 탭으로 필터링하고 파일을 바로 열 수 있습니다."
      />
      <ConnectionNotice configured={res.configured} error={res.error} />
      <DrawingsView drawings={res.data} />
    </>
  );
}
