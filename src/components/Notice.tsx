// 연결/설정/에러/빈 상태 안내 배너

type Tone = "error" | "warn" | "empty";

const TONES: Record<Tone, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  empty: "border-slate-200 bg-white text-slate-500",
};

export default function Notice({
  tone = "empty",
  title,
  detail,
}: {
  tone?: Tone;
  title: string;
  detail?: string;
}) {
  return (
    <div
      className={`rounded-xl border p-6 text-center text-sm ${TONES[tone]}`}
    >
      <p className="font-medium">{title}</p>
      {detail && (
        <p className="mt-1 text-xs opacity-80 break-words">{detail}</p>
      )}
    </div>
  );
}

/** Fetched 결과가 에러/미설정이면 배너를, 정상이면 null 을 반환하는 헬퍼 */
export function ConnectionNotice({
  configured,
  error,
}: {
  configured: boolean;
  error: string | null;
}) {
  if (!error) return null;
  if (!configured) {
    return (
      <Notice
        tone="warn"
        title="Supabase 연결 설정이 필요합니다"
        detail={error}
      />
    );
  }
  return (
    <Notice
      tone="error"
      title="데이터를 불러오지 못했습니다"
      detail={error}
    />
  );
}
