// 외부 건축 협력사 정의 + 제출 자료의 협력사 분류
//
// haeyoung_submissions 의 design_manager / uploaded_by_name / file_path 에서
// 협력사(해영/필/토목)를 추정한다. 매칭 안 되면 기본 '해영'(레거시 데이터 기준).

import type { HaeyoungSubmission } from "@/types";

export type FirmSlug = "haeyoung" | "pil" | "civil";

export const FIRMS: Record<FirmSlug, { name: string; desc: string }> = {
  haeyoung: {
    name: "해영 건축사",
    desc: "해영 건축사가 올린 인허가·설계 자료입니다.",
  },
  pil: {
    name: "필건축사",
    desc: "필건축사가 올린 인허가·설계 자료입니다.",
  },
  civil: {
    name: "토목건축사",
    desc: "토목건축사가 올린 인허가·설계 자료입니다.",
  },
};

export function isFirmSlug(slug: string): slug is FirmSlug {
  return slug === "haeyoung" || slug === "pil" || slug === "civil";
}

/** 협력사별 제출 자료 테이블 (건축사마다 분리) */
export const FIRM_TABLE: Record<FirmSlug, string> = {
  haeyoung: "haeyoung_submissions",
  pil: "pil_submissions",
  civil: "civil_submissions",
};

/** 제출 자료가 어느 협력사 것인지 추정 */
export function submissionFirm(s: HaeyoungSubmission): FirmSlug {
  const hay = [s.design_manager, s.uploaded_by_name, s.file_path]
    .filter(Boolean)
    .join(" ");
  if (/토목/.test(hay)) return "civil";
  if (/필\s*건축/.test(hay)) return "pil";
  if (/해영/.test(hay)) return "haeyoung";
  return "haeyoung"; // 기본: 해영
}
