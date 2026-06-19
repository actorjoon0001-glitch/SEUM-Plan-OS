import PageHeader from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import ModuleBanner from "@/components/ModuleBanner";
import { coordinationItems, projects } from "@/lib/mock-data";
import { formatDate, daysUntil } from "@/lib/format";

function projectName(id: string) {
  return projects.find((p) => p.id === id)?.name ?? id;
}

export default function CoordinationPage() {
  return (
    <>
      <PageHeader
        title="협의도면"
        description="공종 간 간섭을 검토하고 협의 이슈를 추적합니다."
        action={
          <button
            type="button"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            협의 등록
          </button>
        }
      />

      <Card>
        <CardHeader title="협의 이슈" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">제목</th>
                <th className="px-5 py-3 font-medium">프로젝트</th>
                <th className="px-5 py-3 font-medium">공종</th>
                <th className="px-5 py-3 font-medium">담당</th>
                <th className="px-5 py-3 font-medium">기한</th>
                <th className="px-5 py-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {coordinationItems.map((c) => {
                const d = daysUntil(c.dueDate);
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {c.title}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {projectName(c.projectId)}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{c.discipline}</td>
                    <td className="px-5 py-3 text-slate-600">{c.assignee}</td>
                    <td className="px-5 py-3">
                      <span className="text-slate-600">
                        {formatDate(c.dueDate)}
                      </span>
                      <span
                        className={`ml-2 text-[11px] ${
                          d < 0
                            ? "text-rose-500"
                            : d <= 7
                              ? "text-amber-600"
                              : "text-slate-400"
                        }`}
                      >
                        {d < 0 ? `${-d}일 지남` : `D-${d}`}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <ModuleBanner
        items={[
          "3D 모델 간섭 검토(Clash Detection) 결과 연동",
          "협의 이슈별 코멘트 스레드 및 첨부",
          "공종 담당자/외주사 멘션 및 알림",
          "협의 결과 도면 리비전 자동 반영",
        ]}
      />
    </>
  );
}
