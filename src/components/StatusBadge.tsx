// 상태 라벨용 색상 배지 (실제 값이 다양할 수 있어 키워드 기반 + 기본값 처리)

const EXACT: Record<string, string> = {
  설계대기: "bg-slate-100 text-slate-600 ring-slate-500/20",
  설계확인: "bg-blue-50 text-blue-700 ring-blue-600/20",
  최종승인: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  진행중: "bg-blue-50 text-blue-700 ring-blue-600/20",
  완료: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  대기: "bg-slate-100 text-slate-600 ring-slate-500/20",
  보류: "bg-amber-50 text-amber-700 ring-amber-600/20",
  반려: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

// 부분 일치 키워드 → 색상
const KEYWORDS: [string, string][] = [
  ["완료", "bg-emerald-50 text-emerald-700 ring-emerald-600/20"],
  ["승인", "bg-emerald-50 text-emerald-700 ring-emerald-600/20"],
  ["진행", "bg-blue-50 text-blue-700 ring-blue-600/20"],
  ["확인", "bg-blue-50 text-blue-700 ring-blue-600/20"],
  ["대기", "bg-slate-100 text-slate-600 ring-slate-500/20"],
  ["보류", "bg-amber-50 text-amber-700 ring-amber-600/20"],
  ["보완", "bg-amber-50 text-amber-700 ring-amber-600/20"],
  ["반려", "bg-rose-50 text-rose-700 ring-rose-600/20"],
  ["취소", "bg-rose-50 text-rose-700 ring-rose-600/20"],
];

const DEFAULT = "bg-slate-100 text-slate-600 ring-slate-500/20";

function styleFor(status: string): string {
  if (EXACT[status]) return EXACT[status];
  for (const [kw, cls] of KEYWORDS) {
    if (status.includes(kw)) return cls;
  }
  return DEFAULT;
}

export default function StatusBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  const label = status?.trim() || "미지정";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styleFor(
        label,
      )}`}
    >
      {label}
    </span>
  );
}
