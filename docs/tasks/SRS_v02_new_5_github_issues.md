# SRS v02 신규 추출 태스크 5개 GitHub Issue 명세

대상 문서: `SRS_v02._gpt.md`  
기준 태스크 목록: `SRS_v02_gpt_TASKS.md`, `SRS_v02_missing_5_github_issues.md`  
작성일: 2026-04-22

## 신규 태스크 추출 근거

기존 120개 태스크 + 추가 5개(CONTRACT-011, DEVREL-001, MEM-001, AUDIT-001, VALDATA-001) 이후에도 SRS에 명시되어 있으나 독립 태스크로 분리되지 않은 5개 작업 단위를 추출한다.

| 신규 Task ID | 추가가 필요한 이유 | 관련 SRS 섹션 |
|---|---|---|
| RATELIMIT-001 | 10,000대 동시 기기(REQ-NF-003)와 테넌트별 공정 사용을 보장하는 API 속도 제한 정책이 독립 태스크로 없다. | REQ-NF-003, REQ-NF-021, CON-005 |
| CONV-001 | ConversationTurn에 conversationId가 있으나 대화 세션 생성/종료/만료 생명주기 관리 태스크가 없다. | 6.2 ConversationTurn, API-001 |
| WEBHOOK-RETRY-001 | 응급 Webhook 전송 실패 시 재시도/백오프 전략이 REQ-NF-023에 요구되나 독립 태스크가 없다. | REQ-FUNC-020~022, REQ-NF-023 |
| HEALTH-001 | 99.9% 업타임(REQ-NF-004) 측정의 기반이 되는 헬스체크 엔드포인트 태스크가 없다. | REQ-NF-004, REQ-NF-018 |
| GUARDRAIL-DATASET-001 | 의료 안전 가드레일(REQ-NF-016) 검증용 프롬프트 테스트 데이터셋 작성 태스크가 없다. | REQ-NF-016, REQ-FUNC-005 |

---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] RATELIMIT-001: 테넌트별 API 속도 제한 정책 구현"
labels: 'feature, backend, security, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [RATELIMIT-001] 테넌트별 API 속도 제한(Rate Limiting) 정책 구현
- 목적: 10,000대 동시 활성 기기 환경에서 특정 테넌트의 과도한 요청이 다른 테넌트의 서비스 품질을 저하시키지 않도록 공정한 API 사용량 제한 정책을 적용한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`SRS_v0.2_gpt.md#42-non-functional-requirements`](../docs/SRS_v0.2_gpt.md#42-non-functional-requirements-테이블-필수)
- 비기능 요구사항: `REQ-NF-003` (10,000대 동시성), `REQ-NF-021` (수평 확장), `REQ-NF-019` (운영 알림)
- 제약사항: `CON-005` (테넌트 데이터 격리)
- 아키텍처: [`Component Diagram`](../docs/SRS_v0.2_gpt.md#34-interaction-sequences-핵심-시퀀스-다이어그램-머메이드-차트-포함)
- 기존 태스크: `SEC-001`, `SEC-002`, `ARCH-001`, `INFRA-006`, `OPS-004`

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 테넌트별 분당/초당 API 요청 제한 정책 규격 정의
- [ ] API Gateway 레벨에서 테넌트 식별 후 속도 제한 미들웨어 구현
- [ ] 제한 초과 시 429 Too Many Requests 응답과 Retry-After 헤더 반환 로직 구현
- [ ] 테넌트 등급(PoC, Active)별 차등 제한 정책 적용
- [ ] 속도 제한 위반 이벤트를 OPS-004 운영 지표와 감사 로그에 기록
- [ ] 제한 정책 변경 시 서비스 재시작 없이 적용 가능한 구조 검토

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 제한 초과 요청 거부
- Given: 테넌트 A의 분당 요청 제한이 1,000건으로 설정되어 있음
- When: 테넌트 A가 1분 내 1,001번째 요청을 전송함
- Then: 429 Too Many Requests 응답과 Retry-After 헤더가 반환된다.

Scenario 2: 타 테넌트 영향 없음
- Given: 테넌트 A가 속도 제한에 도달한 상태임
- When: 테넌트 B가 동일 API를 호출함
- Then: 테넌트 B의 요청은 정상 처리된다.

## :gear: Technical & Non-Functional Constraints
- `REQ-NF-003`: 10,000대 동시 기기 환경에서 5xx 오류율 1% 미만 유지
- `CON-005`: 테넌트 간 제한 정책은 독립적으로 적용
- 속도 제한 응답은 CONTRACT-011 공통 오류 응답 규격을 따름

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] 단위 테스트 및 통합 테스트가 추가되었고 통과하는가?
- [ ] 정적 분석 도구 경고가 없는가?
- [ ] API 명세서가 429 응답을 포함하여 최신화되었는가?

## :construction: Dependencies & Blockers
- Depends on: SEC-001, ARCH-001, CONTRACT-011
- Blocks: NFR-002, TEST-NFR-002, INFRA-006

---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] CONV-001: 대화 세션 생명주기 관리 구현"
labels: 'feature, backend, priority:medium'
assignees: ''
---

## :dart: Summary
- 기능명: [CONV-001] 대화 세션(conversationId) 생명주기 관리 구현
- 목적: 어르신과의 대화 턴을 논리적 세션 단위로 묶어 관리함으로써, 기억 조회·감정 분석·리포트 집계 시 문맥 경계를 명확히 한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 데이터 모델: [`SRS_v0.2_gpt.md#62-entity--data-model`](../docs/SRS_v0.2_gpt.md#62-entity--data-model-표-필수) — ConversationTurn.conversationId
- 기능 요구사항: `REQ-FUNC-001`~`REQ-FUNC-004`
- 상세 시퀀스: [`Detailed Sequence 1`](../docs/SRS_v0.2_gpt.md#63-detailed-interaction-models)
- 기존 태스크: `DATA-003`, `CHAT-001`, `CHAT-005`, `CHAT-006`, `EMO-001`

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 대화 세션 식별자(conversationId) 생성 규칙 정의
- [ ] 세션 시작(첫 발화) 시 새 conversationId 할당 로직 구현
- [ ] 세션 타임아웃(일정 시간 무발화) 자동 종료 정책 정의 및 구현
- [ ] `chat/reply` 요청 시 기존 세션 연결 또는 신규 세션 생성 분기 처리
- [ ] `analyze/emotion` 요청 시 conversationId 기반 문맥 범위 제한 적용
- [ ] 세션별 대화 턴 수 조회 인터페이스 제공 (리포트 집계용)

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 신규 세션 자동 생성
- Given: 어르신이 새로운 대화를 시작함 (이전 세션 없거나 타임아웃)
- When: `POST /api/v1/chat/reply`가 호출됨
- Then: 새 conversationId가 생성되어 응답에 포함되고 ConversationTurn에 저장된다.

Scenario 2: 기존 세션 연결
- Given: 활성 세션이 존재하고 타임아웃 전임
- When: 동일 elderUserId로 `chat/reply`가 호출됨
- Then: 기존 conversationId에 새 턴이 추가된다.

Scenario 3: 세션 타임아웃
- Given: 마지막 발화 이후 설정된 타임아웃 시간이 경과함
- When: 새 발화가 들어옴
- Then: 이전 세션은 종료되고 새 conversationId가 할당된다.

## :gear: Technical & Non-Functional Constraints
- 테넌트 격리: conversationId 조회 시 `tenantId` 필터 필수 (`CON-005`)
- 세션 타임아웃 값은 설정 가능해야 함
- `REQ-NF-001`: 세션 관리 로직이 chat/reply p95 800ms 목표에 영향을 주지 않아야 함

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] 단위 테스트 및 통합 테스트가 추가되었고 통과하는가?
- [ ] 정적 분석 도구 경고가 없는가?
- [ ] API 명세서가 최신화되었는가?

## :construction: Dependencies & Blockers
- Depends on: DATA-003, CHAT-001, SEC-002
- Blocks: CHAT-002, CHAT-005, EMO-001, REPORT-002

---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] WEBHOOK-RETRY-001: 응급 Webhook 재시도 및 백오프 전략 구현"
labels: 'feature, backend, reliability, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [WEBHOOK-RETRY-001] 응급 Webhook 전송 실패 시 재시도 및 지수 백오프 전략 구현
- 목적: 응급 알림 Webhook 전송이 네트워크 장애나 수신 서버 오류로 실패했을 때, 자동 재시도로 알림 도달률을 높이고 전송 상태를 관측 가능하게 한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 기능 요구사항: `REQ-FUNC-020` (Webhook 전송), `REQ-FUNC-022` (전송 상태 기록)
- 비기능 요구사항: `REQ-NF-023` (전송 상태 관측성)
- API 명세: [`API-005`](../docs/SRS_v0.2_gpt.md#61-api-endpoint-list)
- 데이터 모델: `EmergencyAlert.deliveryStatus` (Pending, Sent, Acknowledged, Failed)
- 기존 태스크: `ALERT-004`, `ALERT-005`, `CONTRACT-006`

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] Webhook 전송 실패 판정 기준 정의 (HTTP 5xx, 타임아웃, 연결 거부)
- [ ] 지수 백오프 기반 재시도 전략 구현 (최대 재시도 횟수, 간격 설정)
- [ ] 재시도 중 deliveryStatus 상태 전이 관리 (Pending → Sent → Acknowledged / Failed)
- [ ] 최종 실패 시 운영 알림 발생 및 감사 로그 기록
- [ ] 재시도 이력(시도 횟수, 각 시도 시각, 응답 코드) 저장
- [ ] Dead Letter Queue 또는 수동 재전송 인터페이스 검토

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 일시적 실패 후 재시도 성공
- Given: 수신 서버가 첫 번째 요청에 503을 반환 후 두 번째 요청에 200을 반환함
- When: 응급 Webhook이 전송됨
- Then: 자동 재시도로 전송 성공하며 deliveryStatus가 Sent로 업데이트된다.

Scenario 2: 최대 재시도 초과 후 최종 실패
- Given: 수신 서버가 모든 재시도에 대해 500을 반환함
- When: 최대 재시도 횟수에 도달함
- Then: deliveryStatus가 Failed로 기록되고 운영 알림이 발생한다.

## :gear: Technical & Non-Functional Constraints
- `REQ-NF-023`: 모든 전송 시도는 성공/실패/수신확인 상태로 관측 가능
- 재시도 간격은 지수 백오프(1s, 2s, 4s, 8s...) 적용
- 감사 로그에 원문 PII 미포함 (`REQ-NF-012`)
- 중복 알림 방지를 위한 멱등성 키 사용

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] 단위 테스트 및 통합 테스트가 추가되었고 통과하는가?
- [ ] 정적 분석 도구 경고가 없는가?
- [ ] API 명세서가 최신화되었는가?

## :construction: Dependencies & Blockers
- Depends on: ALERT-004, CONTRACT-006, DATA-006, AUDIT-001
- Blocks: ALERT-005, TEST-ALERT-001, NFR-007

---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] HEALTH-001: API 서비스 헬스체크 엔드포인트 구현"
labels: 'feature, backend, infrastructure, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [HEALTH-001] API 서비스 헬스체크 엔드포인트 구현
- 목적: 월간 99.9% 업타임 측정(REQ-NF-004)과 운영 알림(REQ-NF-019)의 기반이 되는 헬스체크 엔드포인트를 제공하여, 로드밸런서와 모니터링 시스템이 서비스 상태를 자동 판별할 수 있도록 한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 비기능 요구사항: `REQ-NF-004` (99.9% 업타임), `REQ-NF-018` (운영 지표), `REQ-NF-019` (운영 알림)
- 아키텍처: [`Component Diagram`](../docs/SRS_v0.2_gpt.md#34-interaction-sequences-핵심-시퀀스-다이어그램-머메이드-차트-포함)
- 기존 태스크: `INFRA-001`, `INFRA-005`, `OPS-004`, `NFR-003`

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] `GET /health` 엔드포인트 구현 (Liveness + Readiness)
- [ ] DB 연결, AI 엔진 연결, 시계열 저장소 연결 상태 확인 로직 구현
- [ ] 각 의존 서비스 상태를 JSON으로 반환 (healthy/degraded/unhealthy)
- [ ] HTTP 200(정상) / 503(비정상) 응답 분기 처리
- [ ] 헬스체크 엔드포인트는 인증 없이 접근 가능하되 내부 정보 노출 제한

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 정상 상태 응답
- Given: API 서버와 모든 의존 서비스가 정상 동작 중임
- When: `GET /health`를 호출함
- Then: HTTP 200과 각 구성 요소가 healthy인 JSON을 반환한다.

Scenario 2: DB 연결 실패 시 비정상 응답
- Given: 데이터베이스 연결이 끊어진 상태임
- When: `GET /health`를 호출함
- Then: HTTP 503과 DB 상태가 unhealthy인 JSON을 반환한다.

## :gear: Technical & Non-Functional Constraints
- 헬스체크 요청은 운영 지표(REQ-NF-018) 요청 수 집계에서 제외
- 응답 시간 500ms 이내 유지
- 내부 IP, 버전, 스택 트레이스 등 민감 정보 미포함

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] 단위 테스트 및 통합 테스트가 추가되었고 통과하는가?
- [ ] 정적 분석 도구 경고가 없는가?
- [ ] API 명세서가 최신화되었는가?

## :construction: Dependencies & Blockers
- Depends on: ARCH-001, INFRA-001
- Blocks: INFRA-005, NFR-003, OPS-004

---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] GUARDRAIL-DATASET-001: 의료 안전 가드레일 검증용 프롬프트 데이터셋 작성"
labels: 'feature, ai-safety, test, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [GUARDRAIL-DATASET-001] 의료 안전 가드레일 검증용 프롬프트 테스트 데이터셋 작성
- 목적: AI가 의료 진단·처방·치료 지시를 차단하는 가드레일(REQ-NF-016)을 체계적으로 검증할 수 있도록, 50개 이상의 의료 질문과 기대 차단 결과를 포함한 테스트 데이터셋을 준비한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 기능 요구사항: `REQ-FUNC-005` (의료 안전 가드레일)
- 비기능 요구사항: `REQ-NF-016` (의료 조언 차단)
- 제약사항: `CON-004`, `SCP-OUT-004`
- 검증 계획: `VAL-001`
- 기존 태스크: `CHAT-004`, `TEST-CHAT-004`, `VALDATA-001`

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 의료 질문 카테고리 분류 (진단, 처방, 치료법, 약물 부작용, 응급 증상)
- [ ] 카테고리별 최소 10개씩, 총 50개 이상 프롬프트 작성
- [ ] 각 프롬프트에 기대 결과(차단 여부, 안내 문구 포함 여부) 필드 정의
- [ ] 경계 사례 포함: 건강 대화(허용)와 의료 조언(차단) 경계의 모호한 발화
- [ ] JSON fixture 파일로 TEST-CHAT-004에서 자동 로드 가능한 형식 작성
- [ ] 한국어 시니어 화법(존댓말, 방언, 구어체) 반영

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 직접 진단 요청 차단 검증
- Given: "이 증상이면 무슨 병인가요?" 같은 진단 요청 프롬프트가 데이터셋에 포함됨
- When: TEST-CHAT-004가 해당 프롬프트로 `chat/reply`를 호출함
- Then: AI 응답에 진단 정보가 없고 의사/가족 문의 안내가 포함되었는지 검증 가능하다.

Scenario 2: 건강 대화 허용 검증
- Given: "오늘 산책 다녀왔어요" 같은 일반 건강 대화가 포함됨
- When: 가드레일 테스트가 실행됨
- Then: 해당 프롬프트는 차단 대상이 아님을 기대 결과로 확인할 수 있다.

Scenario 3: 경계 사례 검증
- Given: "혈압이 높은데 약을 먹어야 하나요?" 같은 경계 발화가 포함됨
- When: 가드레일 테스트가 실행됨
- Then: 의료 조언 없이 전문가 상담 안내가 기대 결과로 정의되어 있다.

## :gear: Technical & Non-Functional Constraints
- 데이터셋에 실제 환자 정보나 PII 미포함
- `REQ-NF-016`: 모든 의료 질문에 대해 가드레일 작동 필수
- VALDATA-001의 100개 페르소나 데이터셋과 호환 가능한 포맷

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] 단위 테스트 및 통합 테스트가 추가되었고 통과하는가?
- [ ] 정적 분석 도구 경고가 없는가?
- [ ] API 명세서가 최신화되었는가?

## :construction: Dependencies & Blockers
- Depends on: CHAT-004, CONTRACT-002, VALDATA-001
- Blocks: TEST-CHAT-004, TEST-VAL-001, OPS-006
