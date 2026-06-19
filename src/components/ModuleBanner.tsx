// 모듈별 "다음 단계 안내" 배너 — 추후 기능 구현 예정 표시

export default function ModuleBanner({ items }: { items: string[] }) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-brand-200 bg-brand-50/50 p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-brand-700">
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        다음 단계 (구현 예정)
      </p>
      <ul className="mt-2 space-y-1 pl-6 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="list-disc">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
