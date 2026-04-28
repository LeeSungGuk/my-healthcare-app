# Landing Page Checklist Evaluation

이 문서는 루트 실행형 프로토타입에 추가한 public landing page를 사용 의향 극대화 관점에서 점검한 결과다.

## STEP 0. Service Type Diagnosis

선택 유형: **A 유형, 불안 해소형**

이 프로토타입은 실버케어 AI 서비스의 B2B Partner Console이다. 방문자의 핵심 불안은 "기능이 많나?"보다 "민감정보, API key, 운영 로그, 동의 상태를 안전하게 검증할 수 있나?"에 가깝다. 그래서 Paperpal식의 완결성, 검증, 안전 장치 전략을 기본 축으로 선택했다.

## STEP 1. Core Essentials

| Item | Status | Evidence |
| --- | --- | --- |
| 명확한 헤드라인 | Pass | `Validate eldercare AI workflows without exposing sensitive data.`로 최종 이득을 한 문장에 고정했다. |
| 보조 설명 | Pass | API docs, request testing, operations review, consent visibility를 하나의 controlled surface에서 검토한다고 설명한다. |
| 직관적 이미지 | Pass | 실제 Partner Console 캡처인 `assets/console-home-preview.png`를 히어로 배경으로 사용한다. |
| 동사형 CTA | Pass | `Open the console`, `Review route scope`, `Try the sandbox flow`처럼 행동 중심 문구를 사용한다. |
| CTA 반복 배치 | Pass | 상단 navigation, 히어로, workflow section, final CTA에 반복 배치했다. |
| 숫자/로고 증명 | Partial | `0 default PII exposure target`, `9 Partner Console routes`, `2s p95 initial view target`과 capability proof strip을 배치했다. 실제 고객 로고나 외부 검증 로고는 아직 없다. |

## STEP 2. Type A Strategy

핵심 목표: **완결성**과 **검증**

| Item | Status | Evidence |
| --- | --- | --- |
| A to Z 워크플로우 | Pass | Issue API key -> Test safe scenarios -> Review operations -> Check consent state 흐름으로 검증 여정을 도식화했다. |
| 안전 장치 강조 | Pass | Sandbox default, one-time key reveal, masked operations view, scope guard를 별도 safety section으로 제시했다. |
| 권위 기반 추천 | Partial | 현재 단계에서는 외부 권위자 추천 대신 내부 capability proof를 사용했다. 실제 고객 검증 전에는 의료/보안 자문, 파트너 로고, 컴플라이언스 증빙을 추가해야 한다. |

## STEP 3. Self-Feedback

고객이 첫 화면에서 가져야 할 생각:

> "민감정보를 노출하지 않고도 실버케어 AI 운영 흐름을 검증할 수 있겠군."

현재 페이지의 Kick:

- **압도적인 권위(A)**: 아직 부족하다. 출시 전 실제 파트너, 보안 검토, 의료/돌봄 전문가 검증 증거가 필요하다.
- **놀라운 시연 영상(B)**: 이번 범위에서는 사용하지 않았다. 대신 실제 콘솔 캡처를 전면 배치했다.
- **확실한 효율성 수치(C)**: 보조적으로만 사용했다. 핵심은 효율보다 안전한 검증 흐름이다.

가장 강한 차별점은 **랜딩에서 바로 실제 Partner Console로 진입해 guardrail을 확인할 수 있다는 점**이다. 추상적인 의료 AI 마케팅 페이지가 아니라, route scope, masked evidence, one-time key reveal 같은 검증 가능한 장치를 앞세운다.

## Final Score

Prototype landing readiness: **8.0 / 10**

강점:

- 사용자가 얻는 이득이 "민감정보 노출 없는 검증"으로 명확하다.
- 히어로 이미지가 실제 제품 화면을 보여준다.
- CTA가 현재 콘솔로 직접 연결되어 Hook 이후의 행동 흐름이 짧다.
- 의료/개인정보 도메인에 맞게 안전 장치를 전면에 배치했다.

보강 필요:

- 외부 권위 증거가 아직 없다.
- 실제 사용자 수, 고객 로고, 보안 인증, 의료/돌봄 전문가 추천은 더미로 만들지 않고 실제 확보 후 추가해야 한다.
- 히어로의 `2s p95 initial view target`은 목표치이므로 실제 성능 측정 결과가 생기면 문구를 갱신해야 한다.
- 다음 단계에서는 랜딩 CTA 클릭, 모바일 레이아웃, 금지 문자열 노출 여부를 Playwright smoke test로 자동화하는 편이 좋다.
