// 전자계약서 data(jsonb)를 계약서 문서 형태로 렌더한다. (원본 시스템 로그인 없이 열람)
// 주문 내용(items) · 금액(amounts) · 추가 비용(extraCosts) · 특약사항(terms) · 추가 메모

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

/** 금액 요약 행 (값 있을 때만) */
function MoneyRow({ label, value }: { label: string; value: unknown }) {
  const n = toNum(value);
  if (n === null || n === 0) return null;
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{manwon(value)}</span>
    </div>
  );
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
  const amounts =
    d.amounts && typeof d.amounts === "object" && !Array.isArray(d.amounts)
      ? (d.amounts as Record<string, unknown>)
      : {};
  const extraCosts = Array.isArray(d.extraCosts)
    ? (d.extraCosts as { name?: unknown; amount?: unknown }[])
    : [];
  const terms = Array.isArray(d.terms) ? (d.terms as unknown[]) : [];
  const extraNotes = str(d.extraNotes);
  const memoText = str(d.memo);

  return (
    <Card className="mt-6">
      <CardHeader
        title="전자계약서 내용"
        action={<span className="text-xs text-slate-400">금액 단위: 만원</span>}
      />

      {/* 주문 내용 */}
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
                    : str(it.unit) || "-";
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
                      {toNum(it.amount) !== null ? manwon(it.amount) : "-"}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {note && note !== "-" ? note : ""}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 금액 · 추가 비용 */}
      {(Object.keys(amounts).length > 0 || extraCosts.length > 0) && (
        <div className="grid grid-cols-1 gap-x-10 border-t border-slate-100 px-5 py-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-400">결제 금액</p>
            <MoneyRow label="공급가" value={amounts.productSupply ?? amounts.supplyManual ?? amounts.itemsSupply} />
            <MoneyRow label="부가세" value={amounts.vat} />
            <MoneyRow label="제품 합계" value={amounts.productTotal} />
            <MoneyRow label="계약금" value={amounts.downPayment} />
            <MoneyRow label="중도금 1차" value={amounts.interim1} />
            <MoneyRow label="중도금 2차" value={amounts.interim2} />
            <MoneyRow label="중도금 3차" value={amounts.interim3} />
            <MoneyRow label="잔금" value={amounts.balance} />
          </div>
          {extraCosts.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-400">추가 비용</p>
              {extraCosts.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-slate-100 py-2"
                >
                  <span className="text-sm text-slate-600">{str(c.name) || "-"}</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {manwon(c.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 추가 메모 */}
      {(extraNotes || memoText) && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-xs font-medium text-slate-400">추가 메모</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
            {[extraNotes, memoText].filter(Boolean).join("\n")}
          </p>
        </div>
      )}

      {/* 특약사항 */}
      {terms.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="mb-2 text-xs font-medium text-slate-400">특약사항</p>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
            {terms.map((tm, i) => {
              const s = str(tm).trim();
              if (!s) return null;
              return (
                <li key={i} className="whitespace-pre-wrap">
                  {s}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </Card>
  );
}
