// 전자계약서 data(jsonb)를 계약서 문서(주문 내용 표) 형태로 렌더한다.
// items 배열: { no, name, area, unit, amount(만원), unitPrice, priceLabel, note }

import { Card, CardHeader } from "@/components/Card";

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === "" || v === "-") return null;
  const n = typeof v === "string" ? Number(v.replace(/[^0-9.-]/g, "")) : Number(v);
  return Number.isFinite(n) ? n : null;
}

function manwon(v: unknown): string {
  const n = toNum(v);
  if (n === null) return "-";
  return `${n.toLocaleString()}만원`;
}

function str(v: unknown): string {
  return v === null || v === undefined ? "" : String(v);
}

interface Item {
  no?: unknown;
  name?: unknown;
  area?: unknown;
  unit?: unknown;
  amount?: unknown;
  unitPrice?: unknown;
  priceLabel?: unknown;
  note?: unknown;
}

export default function EContractDoc({ data }: { data: unknown }) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return (
      <Card className="mt-6">
        <CardHeader title="계약서 내용" />
        <p className="px-5 py-6 text-center text-sm text-slate-400">
          계약서 상세 내용이 없습니다.
        </p>
      </Card>
    );
  }

  const d = data as Record<string, unknown>;
  const items: Item[] = Array.isArray(d.items) ? (d.items as Item[]) : [];
  const memoText = str(d.memo);
  const total = items.reduce((sum, it) => sum + (toNum(it.amount) ?? 0), 0);

  return (
    <Card className="mt-6">
      <CardHeader
        title="계약서 — 주문 내용"
        action={<span className="text-xs text-slate-400">금액 단위: 만원</span>}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-2.5 font-medium">순번</th>
              <th className="px-4 py-2.5 font-medium">주문 내용</th>
              <th className="px-4 py-2.5 font-medium">규격</th>
              <th className="px-4 py-2.5 text-right font-medium">단가</th>
              <th className="px-4 py-2.5 text-right font-medium">금액</th>
              <th className="px-4 py-2.5 font-medium">비고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  주문 내용이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((it, i) => {
                const area = str(it.area);
                const spec =
                  area && area !== "-"
                    ? `${area}${it.unit ? ` ${str(it.unit)}` : ""}`
                    : "-";
                const price = it.priceLabel
                  ? str(it.priceLabel)
                  : manwon(it.unitPrice);
                const note = str(it.note);
                return (
                  <tr key={i}>
                    <td className="px-4 py-2.5 text-slate-400">
                      {str(it.no) || i + 1}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      {str(it.name) || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      {spec}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right text-slate-500">
                      {price}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium text-slate-700">
                      {manwon(it.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {note && note !== "-" ? note : ""}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td colSpan={4} className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">
                  제품 합계
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right font-bold text-slate-900">
                  {manwon(total)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {memoText && memoText !== "-" && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-xs font-medium text-slate-400">메모</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
            {memoText}
          </p>
        </div>
      )}
    </Card>
  );
}
