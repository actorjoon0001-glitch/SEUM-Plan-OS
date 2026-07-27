import type { EContract } from "@/types";

// 계약완료를 뜻하는 상태값 (여러 표기 대응)
const COMPLETED = /완료|체결|complete|done|signed/i;

/** 계약완료된 전자계약서인지 */
export function isCompletedEContract(e: EContract): boolean {
  return COMPLETED.test(e.status ?? "");
}
