import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/Card";
import ModuleBanner from "@/components/ModuleBanner";
import { partners } from "@/lib/mock-data";

export default function PartnersPage() {
  return (
    <>
      <PageHeader
        title="외주 소통"
        description="협력 건축설계사·엔지니어링사와의 소통 창구입니다."
        action={
          <button
            type="button"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            협력사 등록
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-base font-bold text-brand-600">
                {p.name.charAt(0)}
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                {p.type}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">
              {p.name}
            </p>
            <p className="text-xs text-slate-500">{p.contactPerson}</p>

            <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <span className="text-slate-400">메일</span>
                {p.email}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-slate-400">연락처</span>
                {p.phone}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-slate-400">진행</span>
                프로젝트 {p.activeProjects}건
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
              >
                메시지
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                도면 공유
              </button>
            </div>
          </Card>
        ))}
      </div>

      <ModuleBanner
        items={[
          "협력사별 메시지 스레드 및 파일 공유",
          "도면·협의 이슈를 외주사와 직접 연동",
          "협력사 전용 제한 접근 권한 관리",
          "이메일/알림톡 발송 연동",
        ]}
      />
    </>
  );
}
