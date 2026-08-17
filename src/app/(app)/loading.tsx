/**
 * 공통 로딩 스켈레톤.
 * force-dynamic 페이지는 서버 조회가 끝나야 렌더되므로, 이 화면이 즉시 떠서
 * 클릭 직후 바로 전환된 느낌을 준다 (조회 중 '멈춘' 것처럼 보이지 않게).
 */
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* 헤더 */}
      <div className="space-y-2">
        <div className="h-7 w-40 rounded bg-slate-200" />
        <div className="h-4 w-72 rounded bg-slate-100" />
      </div>

      {/* 필터/탭 바 */}
      <div className="flex flex-wrap gap-3">
        <div className="h-9 w-24 rounded-lg bg-slate-100" />
        <div className="h-9 w-24 rounded-lg bg-slate-100" />
        <div className="h-9 w-24 rounded-lg bg-slate-100" />
      </div>

      {/* 표 */}
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <div className="h-11 bg-slate-100" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-slate-50 px-4 py-3"
          >
            <div className="h-4 w-6 rounded bg-slate-100" />
            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="h-4 w-20 rounded bg-slate-100" />
            <div className="h-4 flex-1 rounded bg-slate-100" />
            <div className="h-4 w-16 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
