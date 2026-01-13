# create-fullstack-starter

> Fullstack Starter 템플릿을 빠르게 생성하는 CLI 도구

[![npm version](https://img.shields.io/npm/v/create-fullstack-starter.svg)](https://www.npmjs.com/package/create-fullstack-starter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**한국어** | [English](./README.en.md)

## 소개

[fullstack-starter](https://github.com/first-fluke/fullstack-starter) 템플릿을 GitHub에서 다운로드하여 새 프로젝트를 생성합니다.

Next.js 16, FastAPI, Flutter, Terraform, mise 기반의 프로덕션 준비된 풀스택 모노레포 템플릿입니다.

자세한 내용은 [fullstack-starter 저장소](https://github.com/first-fluke/fullstack-starter) 또는 [문서](https://deepwiki.org/first-fluke/fullstack-starter)를 참고하세요.

## 사용법

```bash
# npx로 실행
npx create-fullstack-starter my-project

# 또는 패키지 매니저의 create 명령어 사용
npm create fullstack-starter my-project
yarn create fullstack-starter my-project
pnpm create fullstack-starter my-project

# 대화형으로 실행
npx create-fullstack-starter

# 현재 폴더에 생성
npx create-fullstack-starter .
```

## 옵션

| 옵션 | 설명 |
|------|------|
| `[directory]` | 프로젝트를 생성할 디렉토리 (기본값: 대화형 입력) |
| `-v, --version` | 버전 출력 |
| `-h, --help` | 도움말 출력 |

## 생성 후 다음 단계

```bash
cd my-project
mise install        # 런타임 설치 (Node, Python, Flutter 등)
mise run install    # 의존성 설치
mise infra:up       # 로컬 인프라 시작 (PostgreSQL, Redis, MinIO)
mise dev            # 개발 서버 시작
```

## 라이선스

MIT
