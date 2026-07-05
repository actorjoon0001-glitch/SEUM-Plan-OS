---
name: ship
description: 현재 작업 내용을 새 브랜치에 커밋하고 main 으로 PR을 열어 자동 머지한다. 사용자가 변경을 반영/배포하려 할 때, 또는 "머지", "배포", "ship", "올려줘" 등을 요청할 때 사용.
---

# ship — 새 PR로 main 자동 머지

이 저장소의 표준 작업 흐름. **모든 변경은 새 브랜치에서 작업하고 main 으로 PR을 열어 머지**한다.
main 에 직접 커밋/푸시하지 않는다.

## 절차

1. **변경 확인 & 검증**
   - `git status` 로 변경 확인.
   - 코드 변경이면 머지 전에 `npm run build` (또는 최소 `npm run typecheck`) 통과 확인.

2. **새 브랜치 생성**
   - 항상 새 브랜치에서 작업한다 (기존 브랜치 재사용 금지 — "항상 새 PR").
   - 이름: `claude/<간단한-설명>` (예: `claude/fix-drawings-filter`).
   - `git checkout -b claude/<설명>`

3. **커밋 & 푸시**
   - 명확한 커밋 메시지로 커밋.
   - `git push -u origin claude/<설명>` (네트워크 오류 시 2s/4s/8s/16s 백오프로 최대 4회 재시도).

4. **PR 생성** — GitHub MCP `create_pull_request`
   - repo: `actorjoon0001-glitch/seum-plan-os`
   - base: `main`, head: `claude/<설명>`
   - 제목/본문은 변경 내용을 요약. 본문 끝에:
     `🤖 Generated with [Claude Code](https://claude.com/claude-code)`

5. **자동 머지** — GitHub MCP `merge_pull_request`
   - `merge_method: "squash"` 로 즉시 머지.
   - 브랜치 보호로 필수 체크가 있으면 `enable_pr_auto_merge` 로 자동 머지 예약 후, 체크 통과 시 머지되게 둔다.

6. **정리 & 보고**
   - 로컬을 main 으로 되돌려 최신화: `git checkout main && git pull origin main`.
   - 사용자에게 PR 링크와 머지 결과를 한 줄로 보고.

## 주의

- **비밀키/환경변수(.env.local 등)는 절대 커밋하지 않는다.** (.gitignore 확인)
- 모델 식별자(claude-opus-... 등)를 커밋 메시지/PR 본문에 넣지 않는다.
- Netlify 프로덕션은 `main` 브랜치를 배포하도록 설정되어 있어야 머지가 곧 배포로 이어진다.
