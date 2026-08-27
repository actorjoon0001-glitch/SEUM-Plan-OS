// 사이드바 / 모듈 네비게이션 (설계팀 기준, 섹션 그룹)

export interface NavItem {
  href: string;
  label: string;
  /** 인라인 SVG path (24x24 viewBox, stroke 기반) */
  icon: string;
  description: string;
  /** 상위 항목의 하위(들여쓰기) 항목 여부 */
  indent?: boolean;
  /** 강조 표시 (가장 자주 보는 핵심 메뉴) */
  highlight?: boolean;
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
      {
        href: "/priority",
        label: "설계팀 우선순위",
        description: "계약금 수령 건 · 계약일 빠른 순 설계 큐",
        highlight: true,
        icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
      },
      {
        href: "/review-priority",
        label: "검토자 우선순위",
        description: "작업완료 → 검토자 승인 대기",
        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      },
    ],
  },
  {
    title: "설계 담당자",
    items: [
      {
        href: "/tasks/kimcheolhwan",
        label: "김철환",
        description: "김철환 설계 업무",
        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      },
      {
        href: "/tasks/kimseonghyeon",
        label: "김성현",
        description: "김성현 설계 업무",
        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      },
      {
        href: "/tasks/anjuntaek",
        label: "안준택",
        description: "안준택 설계 업무",
        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      },
      {
        href: "/tasks/kimchanyeong",
        label: "김찬영",
        description: "김찬영 설계 업무",
        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      },
      {
        href: "/tasks/done",
        label: "설계 완료",
        description: "설계진행 상태 완료 건 모아보기",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      },
    ],
  },
  {
    title: "검토자",
    items: [
      {
        href: "/review-priority",
        label: "김민석",
        description: "김민석 검토자 승인 대기",
        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      },
    ],
  },
  {
    title: "설계 작업",
    items: [
      {
        href: "/drawings",
        label: "시공도면",
        description: "계약별 시공도면 (3D 포함)",
        icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
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
    title: "외부 건축 협력사",
    items: [
      {
        href: "/partners/haeyoung",
        label: "해영 건축사",
        description: "해영 건축사 협력 건",
        icon: "M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9h.01M9 12h.01M9 15h.01M9 18h.01",
      },
      {
        href: "/partners/pil",
        label: "필건축사",
        description: "필 건축사 협력 건",
        icon: "M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9h.01M9 12h.01M9 15h.01M9 18h.01",
      },
      {
        href: "/partners/civil",
        label: "토목건축사",
        description: "토목 건축사 협력 건",
        icon: "M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9h.01M9 12h.01M9 15h.01M9 18h.01",
      },
    ],
  },
];
