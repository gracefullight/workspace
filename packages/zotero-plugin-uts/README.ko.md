# UTS APA 7th Citation - Zotero 플러그인

Zotero에서 UTS APA 7th 형식의 참고문헌을 클립보드에 복사하는 플러그인입니다.

> **인용 스타일 참고**: 이 플러그인은 UTS Library의 [APA 7th Referencing Guide (2025년 1월)](https://www.lib.uts.edu.au/help/referencing/apa-referencing-guide)을 기반으로 한 인용 형식을 사용합니다.

## 기능

- 📋 **컨텍스트 메뉴**: 아이템 우클릭 → "UTS APA 7th 인용 복사"
- 🔧 **도구 메뉴**: 도구 → "UTS APA 7th 인용 복사"
- ⌨️ **키보드 단축키**: `Ctrl+Shift+U` (Windows/Linux) 또는 `Cmd+Shift+U` (Mac)
- 🔔 **알림**: 복사 성공/실패 시 시각적 피드백
- 🎨 **아이콘**: 쉽게 식별할 수 있는 커스텀 메뉴 아이콘

## 설치 방법

1. [Releases](https://github.com/gracefullight/pkgs/releases?q=zotero-plugin-uts&expanded=true)에서 최신 `.xpi` 파일을 다운로드합니다
2. Zotero에서 도구 → 플러그인으로 이동합니다
3. 톱니바퀴 아이콘(설정)을 클릭하고 → 파일에서 플러그인 설치를 선택합니다

   ![파일에서 플러그인 설치](docs/install-plugin-from-file.png)

4. 다운로드한 `.xpi` 파일을 선택합니다

## 호환성

- Zotero 7.0+
- Zotero 8.x

## 사용 방법

1. Zotero 라이브러리에서 하나 이상의 아이템을 선택합니다
2. 다음 방법 중 하나를 사용합니다:
   - 우클릭 후 "UTS APA 7th 인용 복사" 선택
   - 도구 → "UTS APA 7th 인용 복사" 이동
   - `Ctrl+Shift+U` (또는 Mac에서 `Cmd+Shift+U`) 누르기
3. 필요한 곳에 인용을 붙여넣습니다

## 개발

```bash
# 의존성 설치
bun install

# 테스트 실행
bun run test

# 빌드
bun run build
```

## 후원

이 프로젝트가 도움이 되셨다면 커피 한 잔 부탁드립니다!

<a href="https://www.buymeacoffee.com/gracefullight" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

또는 스타를 눌러주세요:

```bash
gh api --method PUT /user/starred/gracefullight/pkgs
```

## 라이선스

MIT License - 자세한 내용은 [LICENSE](../../LICENSE)를 참조하세요.

## 제작자

**gracefullight** - [GitHub](https://github.com/gracefullight)
