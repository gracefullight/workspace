# opencode-plugin-mimic

[![npm version](https://img.shields.io/npm/v/opencode-plugin-mimic)](https://www.npmjs.com/package/opencode-plugin-mimic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | **한국어**

> 사용자의 작업 패턴을 학습하고 워크플로에 맞게 적응하는 OpenCode 플러그인입니다.

Mimic은 작업 방식을 관찰하고, 세션 간 기억을 유지하며, 반복되는 행동을 기반으로 제안을 제공합니다.

## 기능

- **패턴 감지**: 반복되는 도구 사용, 파일 편집, git 커밋 메시지 및 채팅 패턴 감지
- **본능 학습(Instinct Learning)**: 프로젝트 히스토리로부터 행동 "본능"(휴리스틱)을 학습
- **아이덴티티 진화(Identity Evolution)**: 사용자에 대해 더 많이 배울수록 플러그인이 자체적인 성격과 통계를 개발
- **세션 기억**: 장기적인 컨텍스트와 함께 세션 간 관찰 및 마일스톤 보존
- **여정 기록**: 프로젝트의 진화를 내러티브로 정리
- **스킬 생성**: 프로젝트 컨텍스트를 기반으로 선언적 스킬(.agent/skills) 자동 생성
- **Git & VCS 통합**: 브랜치, 커밋 메시지, 파일 변경 사항 분석
- **스마트 제안**: 반복 행동에 대한 지름길 생성 또는 기능 진화 제안
- **프로젝트별 상태**: 프로젝트마다 독립적인 패턴과 본능 저장
- **설정 가능**: 학습/제안 활성화, 임계치 조정
- **다국어**: 사용자 설정에 따라 영어/한국어 출력

## 동작 방식

1. **추적**: 도구 호출, 파일 편집, git 히스토리, 그리고 사용자 프롬프트까지 추적
2. **감지**: 패턴 유형별 분류 (tool, file, commit, prompt)
3. **관찰**: 배경 관찰자(Background Observer)가 행동 패턴을 기록하고 분석
4. **학습**: 반복되는 행동을 프로젝트별 규칙인 **본능(Instincts)**으로 정립
5. **적용**: 새로운 세션 시작 시 본능을 자동으로 적용하여 컨텍스트 유지
6. **진화**: 패턴이 임계치에 도달하면 전용 도구나 스킬로 진화 제안
7. **아이덴티티**: 작업이 계속됨에 따라 Mimic의 프로젝트 아이덴티티가 성숙해지며 성격을 얻고 "각성"함

## 설치

### npm (권장)

```bash
npm install -g opencode-plugin-mimic
```

`~/.config/opencode/opencode.json`에 추가:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-plugin-mimic"]
}
```

## 설정

Mimic은 `~/.config/opencode/mimic.json`을 읽어 사용자 설정을 적용합니다.

```json
{
  "language": "ko-KR"
}
```

기본값은 `en-US`입니다.

프로젝트 설정은 `.opencode/mimic/state.json`에 저장되며 `mimic:configure`로 변경할 수 있습니다.

```
mimic:configure({ learningEnabled: false })
mimic:configure({ suggestionEnabled: false })
mimic:configure({ minPatternCount: 5 })
```

## 기능 흐름도 (draw.io)

- 다이어그램 파일: `docs/mimic-flow.drawio`
- diagrams.net(draw.io)에서 열어 확인/편집 가능합니다.

## 사용법

### 커스텀 도구

Mimic은 다음 도구들을 제공합니다:

#### `mimic:init`

프로젝트를 위해 Mimic을 초기화하거나 깨웁니다. 세션 통계, 최근 관찰 사항, 그리고 잠재적인 연속성 힌트가 포함된 환영 메시지를 표시합니다.

#### `mimic:status`

세션 수, 패턴 통계, 최근 수정된 파일, 활성 제안 등을 포함한 현재 상태를 확인합니다.

#### `mimic:journey`

마일스톤, 최근 관찰 사항, git 활동을 포함하여 프로젝트 진화의 내러티브 이야기를 확인합니다.

#### `mimic:patterns`

유형 및 빈도별로 정리된 모든 감지된 패턴(도구, 파일, 커밋 등)을 확인합니다.

#### `mimic:instincts`

학습된 행동 본능을 확인합니다. 본능은 사용자의 작업 스타일로부터 Mimic이 배운 "프로젝트별 규칙"입니다.

#### `mimic:apply`

최근 도구, 수정된 파일 등을 기반으로 현재 컨텍스트에 어떤 본능이 적용되는지 수동으로 확인합니다.

#### `mimic:identity`

성격 유형, "각성" 날짜 및 학습 통계를 포함한 Mimic의 프로젝트 아이덴티티를 확인합니다.

#### `mimic:sequences`

자주 사용되는 도구 시퀀스를 확인하여 일반적인 워크플로 패턴을 파악합니다.

#### `mimic:observations`

현재 프로젝트의 하위 수준 관찰 로그(도구, 파일, 세션)를 확인합니다.

#### `mimic:observe`

수동으로 관찰 사항 추가:

```
mimic:observe({ observation: "보안 강화를 위해 인증 모듈 리팩터링 완료" })
```

#### `mimic:milestone`

프로젝트 마일스톤 기록:

```
mimic:milestone({ milestone: "v1.0.0 릴리스" })
```

#### `mimic:stats`

상세 통계 확인: 총 세션, 도구 호출, 패턴/마일스톤 수, 학습 상태 등.

#### `mimic:configure`

Mimic의 행동 조정:

```
mimic:configure({ learningEnabled: false })     # 학습 중지
mimic:configure({ suggestionEnabled: false })   # 제안 중지
mimic:configure({ minPatternCount: 5 })         # 최소 반복 횟수를 5회로 설정
```

#### `mimic:surface`

패턴을 인지됨/표면화됨 상태로 표시합니다.

#### `mimic:reset`

현재 프로젝트의 모든 학습된 데이터를 삭제합니다.

#### `mimic:grow`

활동 로그를 기반으로 프로젝트의 방향성과 성장 기회를 분석합니다.

#### `mimic:evolve`

반복된 패턴을 기반으로 새로운 기능(Shortcuts, Hooks, Commands, Agents, MCP) 진화를 제안하고 생성합니다.

#### `mimic:generate-skills`

프로젝트 컨텍스트를 분석하고 향후 세션의 정확도를 높이기 위한 `.agent/skills`를 자동으로 생성합니다.

#### `mimic:export` / `mimic:import`

학습된 본능을 JSON 파일로 내보내거나 다른 프로젝트에서 가져옵니다.

#### `mimic:session-context`

세션 간 컨텍스트 요약 및 연속성 힌트를 확인합니다.

#### `mimic:level`

숙련도 수준(technical, semi-technical, non-technical, chaotic)을 설정하여 Mimic의 피드백을 개인화합니다.

#### `mimic:focus`

현재 프로젝트의 집중 분야 또는 기술 스택을 설정합니다.

#### `mimic:mcp-search` / `mimic:mcp`

MCP 서버를 검색하고 프로젝트 설정에 추가합니다.

#### `mimic:capabilities`

진화된 모든 기능 목록을 확인합니다.

## 패턴 임계치

| 패턴 유형 | 임계치 | 결과 |
|-----------|--------|------|
| 도구 사용 | 기본 3회 이상 | 동작 제안 |
| 도구 사용 | 10회 이상 | 단축키 진화 제안 |
| 파일 수정 | 5회 이상 | 훅 진화 제안 |
| 커밋 메시지 | 3회 동일 | 커맨드 진화 제안 |

> 참고: 파일/커밋 패턴은 해당 임계치에 도달해야 생성됩니다. 도구 패턴은 첫 사용부터 누적됩니다.

## 자동 동작

- **세션 시작**: 세션 카운트 증가, 최근 세션 이후 시간 분석, 그리고 **학습된 본능을 자동으로 적용**하여 컨텍스트를 설정합니다.
- **도구 실행**: 패턴 및 시퀀스 감지를 위해 모든 도구 호출을 추적합니다.
- **파일 편집**: 파일 수정 빈도를 추적합니다.
- **배경 관찰(Background Observation)**: 주기적으로 관찰자(Observer)를 실행하여 패턴을 행동 본능으로 정립합니다.
- **자동 진화**: 특정 도메인에서 높은 신뢰도의 패턴이 나타나면 기능을 자동으로 진화시킵니다.
- **스킬 생성**: 새로운 기능이 진화될 때 자동으로 새로운 스킬을 생성합니다.
- **세션 유휴**: 패턴을 분석하고 토스트 메시지를 통해 제안을 표시합니다.
- **세션 종료**: 세션 요약을 기록하고, 다음 세션을 위한 연속성 메모리를 생성하며, 주요 마일스톤을 기록합니다.

> Git 기반 기능은 git 저장소가 필요합니다. 저장소가 없으면 관련 섹션이 비어 보일 수 있습니다.

## 라이선스

MIT
