// 사이드바 / 모듈 네비게이션 (설계팀 기준, 섹션 그룹)

export interface NavItem {
  href: string;
  label: string;
  /** 인라인 SVG path (24x24 viewBox, stroke 기반) */
  icon: string;
  description: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    items: [
      {
        href: "/",
        label: "대시보드",
        description: "설계 진행 현황 한눈에 보기",
        icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      },
    ],
  },
  {
    title: "계약서",
    items: [
      {
        href: "/contracts",
        label: "수기 계약서",
        description: "기존 수기 계약 (설계 작업 기준)",
        icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
      },
      {
        href: "/econtracts",
        label: "전자계약서",
        description: "전자계약서 열람 (현장주소·금액 등)",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      },
    ],
  },
  {
    title: "설계 작업",
    items: [
      {
        href: "/drawings",
        label: "도면",
        description: "계약별 도면 (3D 포함)",
        icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
      },
      {
        href: "/permits",
        label: "인허가",
        description: "인허가 · 제출 서류",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      },
      {
        href: "/messages",
        label: "협의 · 소통",
        description: "계약별 협의 및 외주 소통",
        icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-1-7.87",
      },
      {
        href: "/site-photos",
        label: "현장 사진",
        description: "현장 진행 사진",
        icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.66-.9l.82-1.2A2 2 0 0110.07 4h3.86a2 2 0 011.66.9l.82 1.2a2 2 0 001.66.9H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z",
      },
    ],
  },
];
