// jsonb 데이터를 읽기 좋은 키-값 형태로 렌더링. URL 은 링크로.

function isUrl(v: string): boolean {
  return /^https?:\/\//i.test(v.trim());
}

function Value({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-300">-</span>;
  }
  if (typeof value === "boolean") {
    return <span className="text-slate-700">{value ? "예" : "아니오"}</span>;
  }
  if (typeof value === "number") {
    return <span className="text-slate-700">{value.toLocaleString()}</span>;
  }
  if (typeof value === "string") {
    if (isUrl(value)) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-brand-600 hover:underline"
        >
          {value}
        </a>
      );
    }
    return <span className="whitespace-pre-wrap break-words text-slate-700">{value}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-300">(없음)</span>;
    return (
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="rounded-lg border border-slate-100 p-2">
            <Value value={item} />
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    return <JsonView data={value} nested />;
  }
  return <span className="text-slate-700">{String(value)}</span>;
}

export default function JsonView({
  data,
  nested = false,
}: {
  data: unknown;
  nested?: boolean;
}) {
  if (data === null || data === undefined) {
    return <p className="text-sm text-slate-400">내용이 없습니다.</p>;
  }
  if (typeof data !== "object" || Array.isArray(data)) {
    return <Value value={data} />;
  }

  const entries = Object.entries(data as Record<string, unknown>);
  if (entries.length === 0) {
    return <p className="text-sm text-slate-400">내용이 없습니다.</p>;
  }

  return (
    <dl className={nested ? "space-y-1.5" : "grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2"}>
      {entries.map(([key, val]) => (
        <div key={key} className="text-sm">
          <dt className="text-xs font-medium text-slate-400">{key}</dt>
          <dd className="mt-0.5">
            <Value value={val} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
