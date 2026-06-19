/** 바이트를 사람이 읽기 쉬운 단위로 변환 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/** ISO 날짜 문자열을 'YYYY.MM.DD' 형식으로 */
export function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return iso.replaceAll("-", ".");
}

/** 마감일까지 남은 일수 (음수면 지남) */
export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(iso);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}
