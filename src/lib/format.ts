/** 바이트를 사람이 읽기 쉬운 단위로 변환 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/** ISO 날짜/타임스탬프를 'YYYY.MM.DD' 로 (시간 제거) */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  return iso.slice(0, 10).replaceAll("-", ".");
}

/** 상대 시간 표기 없이 'YYYY.MM.DD HH:mm' */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = iso.replace("T", " ");
  return `${d.slice(0, 10).replaceAll("-", ".")} ${d.slice(11, 16)}`.trim();
}

/** 금액(원)을 '1억 2,300만원' 형태로 */
export function formatMoney(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === "") return "-";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n) || n === 0) return "-";
  const eok = Math.floor(n / 100_000_000);
  const man = Math.floor((n % 100_000_000) / 10_000);
  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok.toLocaleString()}억`);
  if (man > 0) parts.push(`${man.toLocaleString()}만`);
  if (parts.length === 0) return `${n.toLocaleString()}원`;
  return `${parts.join(" ")}원`;
}

/** 파일명에서 확장자 추출 (소문자) */
export function fileExt(name: string | null | undefined): string {
  if (!name) return "";
  const m = name.split(".").pop();
  return m && m !== name ? m.toLowerCase() : "";
}
