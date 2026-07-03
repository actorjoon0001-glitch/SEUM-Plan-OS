// 세움 Plan OS — 실제 세움os Supabase 스키마 기반 타입 정의
// (public 스키마의 설계팀 관련 테이블)

/** 계약 = 프로젝트 단위 (contracts) */
export interface Contract {
  id: number;
  local_id: string | null;
  customer_id: number | null;
  customer_name: string | null;
  model_name: string | null;
  sales_person: string | null;
  showroom_id: string | null;
  status: string | null;
  contract_date: string | null;
  created_at: string | null;

  contract_amount: number | string | null;
  deposit: number | string | null;
  middle_payment: number | string | null;
  balance: number | string | null;

  // 진행 플래그
  priority_done: boolean | null;
  is_urgent: boolean | null;

  // 설계팀 전용 필드
  design_status: string | null;
  design_confirmed: boolean | null;
  design_confirmed_by: string | null;
  design_permit_designer: string | null;
  design_contact_name: string | null;

  // 그 외 단계 확인
  sales_confirmed: boolean | null;
  construction_confirmed: boolean | null;
  final_approved: boolean | null;
  construction_start_ok: boolean | null;

  is_deleted: boolean | null;
}

/** 도면 (contract_drawings) */
export interface ContractDrawing {
  id: number;
  contract_local_id: string | null;
  kind: string | null;
  url: string | null;
  path: string | null;
  file_name: string | null;
  uploaded_by: string | null;
  uploaded_at: string | null;
  sort_order: number | null;
}

/** 인허가/제출 서류 (haeyoung_submissions) */
export interface HaeyoungSubmission {
  id: number;
  title: string | null;
  description: string | null;
  file_name: string | null;
  file_url: string | null;
  file_path: string | null;
  file_size: number | null;
  file_type: string | null;
  contract_local_id: string | null;
  uploaded_by_name: string | null;
  uploaded_at: string | null;
  design_manager: string | null;
  is_deleted: boolean | null;
}

/** 계약별 소통 메시지 (contract_chat_messages) */
export interface ContractChatMessage {
  id: string;
  contract_id: string | null;
  sender_id: string | null;
  sender_name: string | null;
  message: string | null;
  type: string | null;
  is_pinned: boolean | null;
  pinned_at: string | null;
  is_deleted: boolean | null;
  created_at: string | null;
}

/** 현장 진행 사진 (site_progress_photos) */
export interface SiteProgressPhoto {
  id: number;
  contract_local_id: string | null;
  url: string | null;
  path: string | null;
  file_name: string | null;
  note: string | null;
  uploaded_by: string | null;
  uploaded_at: string | null;
}

/** 고객 (customers) */
export interface Customer {
  id: number;
  name: string | null;
  phone: string | null;
  address: string | null;
  source: string | null;
  status: string | null;
  sales_person: string | null;
  created_at: string | null;
}

/** 직원 (employees) */
export interface Employee {
  id: number;
  name: string | null;
  team: string | null;
  role: string | null;
  position_name: string | null;
  showroom: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
}

/** 대금 (payments) */
export interface Payment {
  id: number;
  contract_id: number | null;
  type: string | null;
  amount: number | string | null;
  payment_date: string | null;
}
