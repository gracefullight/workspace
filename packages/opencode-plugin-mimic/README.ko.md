# opencode-plugin-mimic

[![npm version](https://img.shields.io/npm/v/opencode-plugin-mimic)](https://www.npmjs.com/package/opencode-plugin-mimic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | **한국어**

> 사용자의 작업 패턴을 학습하고 워크플로에 맞게 적응하는 OpenCode 플러그인입니다.

Mimic은 작업 방식을 관찰하고, 세션 간 기억을 유지하며, 반복되는 행동을 기반으로 제안을 제공합니다.

## 기능

- **패턴 감지**: 반복되는 도구 사용, 파일 편집, git 커밋 메시지 감지
- **세션 기억**: 관찰/마일스톤을 세션 간 보존
- **여정 기록**: 프로젝트의 진화를 내러티브로 정리
- **Git 히스토리 분석**: 커밋 메시지/변경 파일 분석
- **스마트 제안**: 반복 행동에 대한 지름길 제안
- **프로젝트별 상태**: 프로젝트마다 독립적인 패턴/상태 저장
- **설정 가능**: 학습/제안 활성화, 임계치 조정
- **다국어**: 사용자 설정에 따라 영어/한국어 출력

## 동작 방식

1. **추적**: 도구 호출/파일 편집/git 히스토리 추적
2. **감지**: 패턴 유형별 분류 (tool/file/commit)
3. **기억**: 관찰과 마일스톤을 여정에 기록
4. **제안**: 임계치 도달 시 제안 표면화 및 도구/훅 진화 가능
5. **지속**: 모든 상태를 `.opencode/mimic/`에 저장

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

Mimic은 다음 도구들을 제공합니다:

- `mimic:init`
- `mimic:status`
- `mimic:journey`
- `mimic:patterns`
- `mimic:observe`
- `mimic:milestone`
- `mimic:stats`
- `mimic:configure`
- `mimic:surface`
- `mimic:reset`
- `mimic:grow`
- `mimic:evolve`
- `mimic:level`
- `mimic:focus`
- `mimic:mcp-search`
- `mimic:mcp`
- `mimic:capabilities`

> 참고:
> - `mimic:evolve` 수락 시 프로젝트에 파일이 생성됩니다 (`.opencode/plugins/`, `.opencode/agents/`) 또는 `opencode.json`이 업데이트됩니다.
> - `mimic:mcp-search`는 mcpmarket.com 검색 링크와 인기 MCP 서버 목록을 제공합니다.
> - `mimic:mcp`는 **프로젝트 루트**의 `opencode.json`에 MCP 설정을 추가합니다.
> - `mimic:level`은 상태에 저장되어 개인화에 사용됩니다.

## 상태 구조

```
your-project/
├── .opencode/
│   └── mimic/
│       ├── state.json          # 메인 상태 파일
│       └── sessions/           # 세션별 기록
│           └── {session-id}.json
└── opencode.json
```

### state.json 예시

```json
{
  "version": "0.3.0",
  "project": {
    "name": "your-project",
    "creatorLevel": null,
    "firstSession": 1705940400000,
    "stack": ["node", "typescript"],
    "focus": "auth refactor"
  },
  "journey": {
    "observations": [
      { "observation": "Intensive session with 25 tool calls", "timestamp": "..." }
    ],
    "milestones": [
      { "milestone": "Major refactoring session: 15 files edited", "timestamp": "..." }
    ],
    "sessionCount": 10,
    "lastSession": "2026-01-22T12:00:00.000Z"
  },
  "patterns": [
    {
      "id": "uuid",
      "type": "tool",
      "description": "Read",
      "count": 50,
      "firstSeen": 1705940400000,
      "lastSeen": 1706026800000,
      "surfaced": false,
      "examples": [{ "tool": "read", "callID": "abc", "timestamp": 1706026800000 }]
    }
  ],
  "evolution": {
    "capabilities": [],
    "lastEvolution": null,
    "pendingSuggestions": []
  },
  "preferences": {
    "learningEnabled": true,
    "suggestionEnabled": true,
    "minPatternCount": 3
  },
  "statistics": {
    "totalSessions": 10,
    "totalToolCalls": 250,
    "filesModified": { "src/index.ts": 15 },
    "lastSessionId": null
  }
}
```

## 패턴 임계치

| 패턴 유형 | 임계치 | 결과 |
|-----------|--------|------|
| 도구 사용 | 기본 3회 이상 | 동작 제안 |
| 도구 사용 | 10회 이상 | 단축키 진화 제안 |
| 파일 수정 | 5회 이상 | 훅 진화 제안 |
| 커밋 메시지 | 3회 동일 | 커맨드 진화 제안 |

> 참고: 파일/커밋 패턴은 해당 임계치에 도달해야 생성됩니다. 도구 패턴은 첫 사용부터 누적됩니다.

## 자동 동작

- **세션 시작**: 세션 카운트 증가, 장기 이탈 감지
- **도구 실행**: 도구 호출 패턴 추적
- **파일 편집**: 파일 수정 빈도 추적
- **세션 유휴**: 커밋/파일 패턴 분석 및 제안 출력
- **세션 종료**: 집중 세션/대규모 리팩터링 기록

> Git 기반 기능은 git 저장소가 필요합니다. 저장소가 없으면 관련 섹션이 비어 보일 수 있습니다.

## 라이선스

MIT
