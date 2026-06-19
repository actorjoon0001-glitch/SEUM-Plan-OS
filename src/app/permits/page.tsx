import PageHeader from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import ModuleBanner from "@/components/ModuleBanner";
import { permits, projects } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

function projectName(id: string) {
  return projects.find((p) => p.id === id)?.name ?? id;
}

export default function PermitsPage() {
  return (
    <>
      <PageHeader
        title="인허가"
        description="인허가 접수 현황과 진행 단계를 추적합니다."
        action={
          <button
            type="button"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            인허가 추가
          </button>
        }
      />

      <Card>
        <CardHeader title="인허가 현황" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">인허가명</th>
                <th className="px-5 py-3 font-medium">프로젝트</th>
                <th className="px-5 py-3 font-medium">처리기관</th>
                <th className="px-5 py-3 font-medium">접수일</th>
                <th className="px-5 py-3 font-medium">예정일</th>
                <th className="px-5 py-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {permits.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {p.name}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {projectName(p.projectId)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{p.authority}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatDate(p.submittedAt)}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatDate(p.expectedAt)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ModuleBanner
        items={[
          "인허가 단계별 체크리스트 및 제출 서류 관리",
          "보완 요청 사항 추적 및 마감 알림",
          "인허가대행사와 진행 상황 공유",
          "세움터 등 외부 시스템 연동 검토",
        ]}
      />
    </>
  );
}
