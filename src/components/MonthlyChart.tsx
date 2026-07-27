import { Card, CardHeader } from "@/components/Card";

export interface MonthlyDatum {
  /** "YYYY-MM" */
  month: string;
  total: number;
  done: number;
}

/**
 * 월별 계약 현황 막대그래프 (의존성 없는 CSS 바 차트).
 * 각 막대는 해당 월 계약 수이며, 설계완료(브랜드) / 진행중(주황)으로 나뉜다.
 */
export default function MonthlyChart({ data }: { data: MonthlyDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  const totalSum = data.reduce((a, d) => a + d.total, 0);
  const doneSum = data.reduce((a, d) => a + d.done, 0);
  const range =
    data.length > 0
      ? `${data[0].month.replace("-", ".")} – ${data[data.length - 1].month.replace("-", ".")}`
      : "";

  return (
    <Card>
      <CardHeader
        title="월별 계약 현황"
        action={
          <span className="text-xs text-slate-400">
            최근 12개월 · 계약일 기준
          </span>
        }
      />
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: 180 }}>
          {data.map((d, i) => {
            const h = (d.total / max) * 100;
            const donePct = d.total ? (d.done / d.total) * 100 : 0;
            const isYearStart = i === 0 || d.month.endsWith("-01");
            return (
              <div
                key={d.month}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span className="text-[11px] font-medium text-slate-500">
                  {d.total || ""}
                </span>
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    className="flex w-5 flex-col justify-end overflow-hidden rounded-md sm:w-7"
                    style={{ height: `${d.total ? Math.max(h, 4) : 0}%` }}
                    title={`${d.month} · 총 ${d.total}건 (설계완료 ${d.done})`}
                  >
                    <div
                      className="w-full bg-amber-400"
                      style={{ height: `${100 - donePct}%` }}
                    />
                    <div
                      className="w-full bg-brand-500"
                      style={{ height: `${donePct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] leading-none text-slate-400">
                  {Number(d.month.slice(5))}월
                </span>
                <span className="h-3 text-[9px] leading-none text-slate-300">
                  {isYearStart ? `'${d.month.slice(2, 4)}` : ""}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-400">{range}</span>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-brand-500" /> 설계완료{" "}
              {doneSum}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> 진행중{" "}
              {totalSum - doneSum}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
