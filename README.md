# 세움 Plan OS — 설계팀 워크스페이스

세움디자인하우징 **설계팀 전용** 화면입니다. 운영 시스템(세움os) Supabase의 실제 데이터를
가져와, 설계팀이 계약·도면·인허가·협의·현장을 **한 곳에서 편하게** 보고 작업하도록 구성했습니다.

## 기술 스택

- **Next.js 15** (App Router, 서버 컴포넌트) + **React 19**
- **TypeScript** · **Tailwind CSS**
- **Supabase** (`@supabase/supabase-js`) — 세움os 운영 DB 읽기 연동

## 시작하기

```bash
npm install
cp .env.example .env.local   # 이미 .env.local 이 있으면 생략
npm run dev                  # → http://localhost:3000
```

### 환경변수 (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://uqsswlunnpdhledmoarj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

> `.env.local` 은 `.gitignore` 로 커밋되지 않습니다. publishable(anon) 키는 클라이언트
> 노출용이며, 실제 접근 범위는 Supabase RLS 정책을 따릅니다.

## 화면 구성 (설계팀 기준)

| 메뉴 | 경로 | 원본 테이블 | 설명 |
| --- | --- | --- | --- |
| 대시보드 | `/` | contracts 외 | 설계 진행 현황, 설계 필요 계약, 상태 분포 |
| 계약·프로젝트 | `/contracts` | `contracts` | 설계 대상 계약 목록 + 상태/검색 필터 |
| 계약 상세 | `/contracts/[local_id]` | 여러 테이블 | 한 계약의 도면·인허가·사진·소통·대금 통합 |
| 도면 | `/drawings` | `contract_drawings` | 도면 목록, 종류(3D 등) 필터, 파일 열기 |
| 인허가 | `/permits` | `haeyoung_submissions` | 인허가·제출 서류 |
| 협의·소통 | `/messages` | `contract_chat_messages` | 계약별 협의/외주 소통 |
| 현장 사진 | `/site-photos` | `site_progress_photos` | 현장 진행 사진 |

## 로그인 (인증)

- **세움os 계정(이메일·비밀번호)으로 그대로 로그인**합니다. 같은 Supabase 프로젝트의
  Supabase Auth 를 공유하므로 별도 계정 생성이 필요 없습니다.
- 로그인하지 않으면 모든 페이지가 `/login` 으로 리다이렉트됩니다 (`src/middleware.ts`).
- 로그인 사용자는 `employees` 테이블(`auth_user_id`/`email` 매칭)로 이름·팀을 표시합니다.
- Supabase SSR(`@supabase/ssr`) 쿠키 세션: `src/lib/supabase/{client,server,middleware}.ts`.

> 참고: 현재는 **앱 접근을 로그인으로 막는** 방식입니다. 데이터 자체를 팀별로 더 엄격히
> 제한하려면 Supabase RLS 정책을 인증 기반으로 강화하면 됩니다 (다음 단계 선택).

## 데이터 연결 구조

- 모든 데이터 접근은 `src/lib/data.ts` 에 모여 있습니다. (테이블별 조회 함수)
- 계약(`contracts`)이 중심이며, `local_id` 로 도면·인허가·사진·소통이 연결됩니다.
- 설계 관련 표시 로직은 `src/lib/contract.ts` (담당자·설계상태 등).
- 연결 실패/미설정 시 화면 상단에 안내 배너(`ConnectionNotice`)가 표시됩니다.

## 현재 상태 (2차 — 실데이터 연동)

- ✅ 세움os Supabase 실데이터 **읽기 연동**
- ✅ 설계팀 기준 6개 메뉴 + 계약 상세 통합 뷰
- ✅ 삭제(`is_deleted`) 항목 자동 제외, 설계 상태별 집계
- ⏳ **쓰기 기능(업로드·상태변경)** — 운영 DB 보호를 위해 인증/권한(RLS) 확인 후 다음 단계

### 확인이 필요한 부분 (실데이터로 검증 시)

- `contract_chat_messages.contract_id` 가 `contracts.local_id` 와 매칭된다고 가정했습니다.
  (다르면 `src/lib/data.ts` 의 `getMessages` 조건만 조정)
- `employees.team` 에서 설계팀 필터는 `%설계%` 로 잡았습니다. (실제 팀명에 맞게 조정 가능)

## 디렉터리 구조

```
src/
├── app/
│   ├── page.tsx                  # 대시보드
│   ├── contracts/                # 계약 목록 + [local_id] 상세
│   ├── drawings/                 # 도면
│   ├── permits/                  # 인허가
│   ├── messages/                 # 협의·소통
│   └── site-photos/              # 현장 사진
├── components/                   # 공용 UI
├── lib/
│   ├── supabase.ts               # Supabase 클라이언트
│   ├── data.ts                   # 테이블별 데이터 조회
│   ├── contract.ts               # 설계 표시 로직
│   ├── navigation.ts             # 사이드바 메뉴
│   └── format.ts                 # 포맷 유틸(날짜·금액·용량)
└── types/                        # 실제 스키마 기반 타입
```
