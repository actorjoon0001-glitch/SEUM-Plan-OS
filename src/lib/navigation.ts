// 사이드바 / 모듈 네비게이션 정의

export interface NavItem {
  href: string;
  label: string;
  /** 인라인 SVG path (24x24 viewBox, stroke 기반) */
  icon: string;
  description: string;
}

export const navItems: NavItem[] = [
  {
    href: "/",
    label: "대시보드",
    description: "전체 프로젝트 현황 한눈에 보기",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: "/drawings",
    label: "도면 업로드",
    description: "도면 파일 업로드 및 버전 관리",
    icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
  },
  {
    href: "/models-3d",
    label: "3D 도면 작업",
    description: "3D 모델 뷰어 및 BIM 작업",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    href: "/coordination",
    label: "협의도면",
    description: "공종 간 간섭 검토 및 협의",
    icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-1-7.87",
  },
  {
    href: "/permits",
    label: "인허가",
    description: "인허가 접수 및 진행 추적",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    href: "/partners",
    label: "외주 소통",
    description: "협력 건축설계사·엔지니어 관리",
    icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  },
];
