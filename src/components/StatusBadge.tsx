// 상태 라벨용 색상 배지

const STYLES: Record<string, string> = {
  // 프로젝트
  진행중: "bg-blue-50 text-blue-700 ring-blue-600/20",
  보류: "bg-amber-50 text-amber-700 ring-amber-600/20",
  완료: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  // 협의
  검토대기: "bg-slate-100 text-slate-600 ring-slate-500/20",
  협의중: "bg-blue-50 text-blue-700 ring-blue-600/20",
  수정요청: "bg-rose-50 text-rose-700 ring-rose-600/20",
  // 인허가
  준비: "bg-slate-100 text-slate-600 ring-slate-500/20",
  접수: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  보완: "bg-amber-50 text-amber-700 ring-amber-600/20",
  승인: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  반려: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? "bg-slate-100 text-slate-600 ring-slate-500/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}
