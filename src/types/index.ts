// 세움 Plan OS 공통 타입 정의

/** 프로젝트 단계 */
export type ProjectPhase =
  | "기획"
  | "계획설계"
  | "기본설계"
  | "실시설계"
  | "인허가"
  | "착공"
  | "준공";

/** 프로젝트 진행 상태 */
export type ProjectStatus = "진행중" | "보류" | "완료";

export interface Project {
  id: string;
  name: string;
  client: string;
  phase: ProjectPhase;
  status: ProjectStatus;
  /** 진행률 0~100 */
  progress: number;
  /** 담당 PM */
  manager: string;
  /** 마감 예정일 (ISO date) */
  dueDate: string;
  updatedAt: string;
}

/** 도면 종류 */
export type DrawingType = "건축" | "구조" | "설비" | "전기" | "조경" | "토목";

export interface Drawing {
  id: string;
  projectId: string;
  name: string;
  type: DrawingType;
  /** 버전 (예: A, B, C 또는 Rev.01) */
  version: string;
  /** 파일 형식 */
  format: "dwg" | "pdf" | "rvt" | "ifc" | "skp" | "png";
  /** 바이트 단위 크기 */
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

/** 협의도면(코디네이션) 이슈 상태 */
export type CoordinationStatus = "검토대기" | "협의중" | "수정요청" | "완료";

export interface CoordinationItem {
  id: string;
  projectId: string;
  title: string;
  discipline: DrawingType;
  status: CoordinationStatus;
  assignee: string;
  dueDate: string;
}

/** 인허가 단계 상태 */
export type PermitStatus = "준비" | "접수" | "보완" | "승인" | "반려";

export interface Permit {
  id: string;
  projectId: string;
  name: string;
  authority: string;
  status: PermitStatus;
  submittedAt: string | null;
  expectedAt: string | null;
}

/** 외주 협력사 종류 */
export type PartnerType =
  | "건축설계사"
  | "구조설계"
  | "설비설계"
  | "전기설계"
  | "인허가대행"
  | "측량"
  | "감리";

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  contactPerson: string;
  email: string;
  phone: string;
  /** 함께 진행 중인 프로젝트 수 */
  activeProjects: number;
}
