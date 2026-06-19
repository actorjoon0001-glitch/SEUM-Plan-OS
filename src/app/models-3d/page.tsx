import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/Card";
import ModuleBanner from "@/components/ModuleBanner";
import { drawings, projects } from "@/lib/mock-data";

function projectName(id: string) {
  return projects.find((p) => p.id === id)?.name ?? id;
}

export default function Models3DPage() {
  // 3D 작업 대상 = BIM/3D 포맷 도면
  const models = drawings.filter((d) =>
    ["rvt", "ifc", "skp"].includes(d.format),
  );

  return (
    <>
      <PageHeader
        title="3D 도면 작업"
        description="BIM·3D 모델을 뷰어로 확인하고 협업합니다."
      />

      {/* 3D 뷰어 자리 */}
      <Card className="overflow-hidden">
        <div className="flex aspect-[16/7] items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="text-center">
            <svg
              className="mx-auto h-14 w-14 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p className="mt-3 text-sm font-medium text-slate-300">
              3D 모델 뷰어 영역
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Three.js / IFC.js 기반 뷰어 연동 예정
            </p>
          </div>
        </div>
      </Card>

      {/* 모델 리스트 */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((m) => (
          <Card key={m.id} className="p-5">
            <div className="flex items-center justify-between">
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                {m.format}
              </span>
              <span className="text-xs text-slate-400">{m.version}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">
              {m.name}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {projectName(m.projectId)}
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-600"
            >
              뷰어로 열기
            </button>
          </Card>
        ))}
      </div>

      <ModuleBanner
        items={[
          "IFC / glTF 웹 뷰어(Three.js) 임베드",
          "단면·레이어 토글, 측정 도구",
          "모델 위 코멘트(마크업) 협업",
          "도면 모듈과 3D 모델 버전 연동",
        ]}
      />
    </>
  );
}
