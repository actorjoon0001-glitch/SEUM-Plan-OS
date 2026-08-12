// 설계팀 구성원 (설계 업무 리스트) — 사이드바/개인별 업무 페이지용

export interface Member {
  /** URL 세그먼트 (영문 슬러그) */
  slug: string;
  /** 표시 이름 (한글) */
  name: string;
}

export const MEMBERS: Member[] = [
  { slug: "kimcheolhwan", name: "김철환" },
  { slug: "kimseonghyeon", name: "김성현" },
  { slug: "anjuntaek", name: "안준택" },
  { slug: "kimchanyeong", name: "김찬영" },
];

export function memberBySlug(slug: string): Member | undefined {
  return MEMBERS.find((m) => m.slug === slug);
}
