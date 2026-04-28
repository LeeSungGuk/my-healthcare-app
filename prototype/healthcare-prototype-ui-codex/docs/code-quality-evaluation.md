# Code Quality Evaluation

이 문서는 `prototype/healthcare-prototype-ui-codex`의 현재 코드 품질을 프로토타이핑 완료 기준으로 평가한다.

## Overall Assessment

현재 코드는 **검사용 프로토타입으로는 충분히 명확하고 실행 가능**하다. 의존성 없는 정적 SPA라는 선택 덕분에 실행 마찰이 낮고, public landing page와 protected Partner Console의 진입 구조가 단순하다. privacy/security 핵심 정책은 테스트로 고정되어 있다. 다만 제품화 단계로 넘어가려면 렌더링 모듈 분리, UI 테스트 확대, schema 기반 validation 강화가 필요하다.

점수: **7.4 / 10**

## Evaluation Matrix

| Area | Score | Assessment |
| --- | ---: | --- |
| Runtime simplicity | 9 | Node.js만 있으면 실행 가능하고 dependency install이 없다. |
| Scope control | 8 | Landing route는 public entry로 분리하고 Partner Console 범위는 route inventory와 test로 제한한다. |
| Privacy/security posture | 8 | PII redaction, API key one-time reveal, role guard가 정책 모듈에 있다. |
| Test coverage | 6 | 정책 테스트는 좋지만 DOM/UI smoke test는 없다. |
| Maintainability | 6 | `src/app.mjs`가 커져서 장기 유지보수에는 분리 필요성이 있다. |
| Accessibility readiness | 6 | label과 semantic table은 있으나 keyboard/focus audit은 아직 없다. |
| Documentation | 8 | README, master prompt, component/code quality docs가 생겼다. |

## Strengths

- `src/policies.mjs`가 public landing route, 보안/권한/route guard의 중심이라 리뷰 포인트가 명확하다.
- `tests/policies.test.mjs`가 가장 위험한 요구사항을 직접 검증한다.
- 루트 진입 화면이 랜딩페이지이고 CTA를 통해 콘솔로 이동하므로 고객 Hook 단계와 검사용 콘솔이 분리된다.
- mock data가 synthetic fixture로 분리되어 실제 개인정보나 production tenant data가 섞일 위험을 낮춘다.
- 서버가 단순하고 SPA fallback이 있어 route hash 기반 화면 확인이 쉽다.
- README와 docs가 reviewer와 AI agent 모두에게 프로젝트 의도를 전달한다.

## Risks

- `src/app.mjs`가 single-file renderer라 화면이 늘어나면 diff가 커지고 부분 테스트가 어렵다.
- 랜딩페이지와 콘솔 렌더러가 같은 파일에 있어 고도화 단계에서는 모듈 경계가 흐려질 수 있다.
- 문자열 template 기반 렌더링은 복잡한 state interaction이 늘어날수록 escape 누락, event target 실수, DOM 구조 회귀 가능성이 있다.
- redaction은 demo pattern 중심이다. 실제 데이터 형태가 다양해지면 정책 함수만으로 충분하지 않을 수 있다.
- 현재 E2E/browser smoke test가 없어서 responsive layout, focus order, route interaction은 수동 확인에 의존한다.
- mock action은 audit 대상임을 UI로 표현하지만 실제 audit log contract와 연결되어 있지는 않다.

## Recommended Quality Gates

프로토타입 이후 다음 단계로 넘어갈 때는 아래 gate를 추가한다.

1. 랜딩 CTA와 각 console route가 렌더링되는 browser smoke test.
2. role switch 후 permission denied state가 나오는지 검증하는 DOM test.
3. 화면 HTML에서 금지 문자열(raw transcript, 주민번호, 원문 API key 등)이 없는지 검사하는 privacy scan.
4. Playground request builder를 OpenAPI-compatible schema에서 생성하는 contract test.
5. 주요 table과 form control의 keyboard navigation/focus state 확인.

## Release Readiness

현재 상태는 **prototype review ready**다. 운영 배포나 실제 사용자 테스트 단계는 아니다. 목적은 UI scope, IA, privacy guardrail, developer/operator workflow를 검토하는 것이며, 실제 API, auth, database, audit log 연동은 포함하지 않는다.
