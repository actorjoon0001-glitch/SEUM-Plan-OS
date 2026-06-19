import PageHeader from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/Card";
import ModuleBanner from "@/components/ModuleBanner";
import { drawings, projects } from "@/lib/mock-data";
import { formatFileSize, formatDate } from "@/lib/format";

function projectName(id: string) {
  return projects.find((p) => p.id === id)?.name ?? id;
}

export default function DrawingsPage() {
  return (
    <>
      <PageHeader
        title="도면 업로드"
        description="도면 파일을 업로드하고 버전과 공종별로 관리합니다."
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            도면 업로드
          </button>
        }
      />

      {/* 업로드 드롭존 (UI 시안) */}
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white py-12 text-center">
        <svg
          className="h-10 w-10 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="mt-3 text-sm font-medium text-slate-600">
          파일을 드래그하거나 클릭하여 업로드
        </p>
        <p className="mt-1 text-xs text-slate-400">
          DWG, PDF, RVT, IFC, SKP 지원 · Supabase Storage 연동 예정
        </p>
      </div>

      {/* 도면 목록 */}
      <Card className="mt-6">
        <CardHeader title="등록된 도면" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">도면명</th>
                <th className="px-5 py-3 font-medium">프로젝트</th>
                <th className="px-5 py-3 font-medium">공종</th>
                <th className="px-5 py-3 font-medium">버전</th>
                <th className="px-5 py-3 font-medium">형식</th>
                <th className="px-5 py-3 font-medium">크기</th>
                <th className="px-5 py-3 font-medium">업로드</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {drawings.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {d.name}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {projectName(d.projectId)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{d.type}</td>
                  <td className="px-5 py-3 text-slate-600">{d.version}</td>
                  <td className="px-5 py-3">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium uppercase text-slate-500">
                      {d.format}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatFileSize(d.size)}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {d.uploadedBy} · {formatDate(d.uploadedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ModuleBanner
        items={[
          "Supabase Storage 버킷 연동 및 실제 파일 업로드",
          "도면 버전 히스토리 및 변경 비교",
          "공종·프로젝트별 필터 및 검색",
          "도면 미리보기(PDF/이미지 썸네일) 생성",
        ]}
      />
    </>
  );
}
