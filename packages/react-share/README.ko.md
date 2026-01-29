# @gracefullight/react-share

React를 위한 가볍고 유연한 헤드리스 소셜 공유 라이브러리입니다. 전략 패턴(Strategy Pattern) 기반으로 설계되어 확장이 용이하며, UI에 대한 완전한 통제권을 제공합니다.

## 주요 기능

- 🧩 **헤드리스 (Headless)**: UI에 대한 제약이 없습니다. 프로젝트의 디자인 시스템에 맞는 버튼과 아이콘을 그대로 사용하세요.
- 🚀 **성능 최적화**: Kakao, Facebook과 같은 외부 SDK는 해당 플랫폼 공유가 필요할 때만 지연 로딩(Lazy Loading)됩니다.
- 🛠 **전략 패턴**: 각 플랫폼별 공유 로직이 분리되어 있어 유지보수와 확장이 매우 쉽습니다.
- 📱 **네이티브 공유**: Web Share API를 통한 모바일 네이티브 공유를 지원합니다.
- 🔗 **동적 URL**: 버튼 클릭 시점에 단축 URL을 생성하거나 API를 호출하는 비동기 URL 처리 기능을 지원합니다.

## 아키텍처

```mermaid
flowchart TD
    User[👤 사용자 액션<br/>공유 버튼 클릭] --> Hook[⚛️ useHeadlessShare Hook<br/>상태 관리 및 SDK 로딩]
    Hook --> Registry[📋 전략 레지스트리<br/>Map<platform, ShareStrategy>]
    Registry --> Strategy{플랫폼 전략}
    
    Strategy -->|SDK 지연 로딩| Kakao[KakaoStrategy]
    Strategy -->|SDK 지연 로딩| Facebook[FacebookStrategy]
    Strategy -->|직접 URL| Direct[직접 URL 전략<br/>Twitter, Pinterest 등]
    Strategy -->|Web Share API| Native[NativeStrategy]
    Strategy -->|클립보드| Link[LinkStrategy]
    Strategy -->|커스텀| Custom[커스텀 전략<br/>registerShareStrategy()]
    
    Kakao --> Exec[🚀 공유 실행]
    Facebook --> Exec
    Direct --> Exec
    Native --> Exec
    Link --> Exec
    Custom --> Exec
    
    style Hook fill:#d5e8d4,stroke:#82b366
    style Registry fill:#fff2cc,stroke:#d6b656
    style Kakao fill:#e1d5e7,stroke:#9673a6
    style Facebook fill:#e1d5e7,stroke:#9673a6
    style Direct fill:#f8cecc,stroke:#b85450
    style Native fill:#ffe6cc,stroke:#d79b00
    style Link fill:#ffe6cc,stroke:#d79b00
    style Custom fill:#e6f3ff,stroke:#0070c0,stroke-dasharray: 5 5
    style Exec fill:#f5f5f5,stroke:#666666
```

이 라이브러리는 **전략 패턴(Strategy Pattern)**을 사용하여 플랫폼별 구현을 관리합니다:

1. **Hook 레이어**: `useHeadlessShare`가 상태 및 SDK 로딩을 관리합니다
2. **전략 레지스트리**: 플랫폼을 해당 전략에 매핑합니다
3. **플랫폼 전략**: SDK 기반(Kakao, Facebook), 직접 URL(Twitter 등), 시스템 공유(Web Share API), 클립보드
4. **확장 가능**: `registerShareStrategy()`로 커스텀 전략을 등록할 수 있습니다

## 지원 플랫폼

- 카카오톡 (Kakao)
- 페이스북 (Facebook)
- 트위터 (Twitter)
- 핀터레스트 (Pinterest)
- 왓츠앱 (WhatsApp)
- 라인 (Line)
- 스레드 (Threads)
- 시스템 공유 (Native Share)
- 클립보드에 복사 (Link Copy)

## 설치

```bash
npm install @gracefullight/react-share
# 또는
bun add @gracefullight/react-share
```

## 기본 사용법

### 컴포넌트 방식 (권장)

`HeadlessShareButton`을 사용하면 SDK 로딩과 비동기 처리를 간편하게 구현할 수 있습니다.

```tsx
import { HeadlessShareButton } from '@gracefullight/react-share';

function MyShareComponent() {
  return (
    <HeadlessShareButton
      type="kakao"
      data={{
        id: "recipe-1",
        title: "맛있는 파스타 레시피",
        description: "Pic2Cook에서 확인한 최고의 레시피입니다.",
        url: "https://pic2cook.com/recipe/1",
        imageUrl: "https://pic2cook.com/image.jpg"
      }}
      options={{
        kakao: { jsKey: 'YOUR_KAKAO_JS_KEY' }
      }}
    >
      {({ onClick, isLoading }) => (
        <button onClick={onClick} disabled={isLoading}>
          {isLoading ? '로딩 중...' : '카카오톡으로 공유하기'}
        </button>
      )}
    </HeadlessShareButton>
  );
}
```

### Hook 방식

더 세밀한 제어가 필요한 경우 `useHeadlessShare` 훅을 직접 사용할 수 있습니다.

```tsx
import { useHeadlessShare } from '@gracefullight/react-share';

function CustomShare() {
  const { share, isSdkReady } = useHeadlessShare({
    type: 'twitter',
    onShareError: (err) => alert('공유 중 오류가 발생했습니다.'),
  });

  return (
    <button onClick={() => share({ url: '...' })} disabled={!isSdkReady}>
      트위터 공유
    </button>
  );
}
```

## 심화: 비동기 URL 처리

버튼 클릭 시점에 공유용 URL을 가져와야 할 때 `url` 속성에 비동기 함수를 전달할 수 있습니다.

```tsx
<HeadlessShareButton
  data={{
    id: "1",
    title: "레시피",
    url: async () => {
      const shortUrl = await fetchShortUrl(originalUrl);
      return shortUrl;
    }
  }}
  // ...
/>
```

## 다른 라이브러리와 비교

| 기능 | 기존 라이브러리 | @gracefullight/react-share |
|---------|----------------------|---------------------------|
| **아키텍처** | 컴포넌트 기반 | 헤드리스 (render props) |
| **UI 제어** | 제한적 (빌트인 버튼/아이콘) | 완전한 제어 (자체 UI 사용) |
| **번들 크기** | 큼 (SVG 아이콘 포함) | 작음 (아이콘 미포함) |
| **동적 URL** | 부분 지원 (beforeOnClick) | 완전 지원 (async URL resolver) |
| **SDK 로딩** | 없음 (팝업 기반) | 지연 로딩 (Kakao, Facebook) |
| **타입 안전성** | 기본 | Discriminated unions |
| **커스터마이징** | 스타일 props | 완전한 UI 자유도 |
| **디자인 시스템** | 통합 어려움 | 원활한 통합 |

## 개발 지원

이 라이브러리가 도움이 되셨다면 다음 방법으로 지원해 주세요:

- [♥ GitHub Sponsors](https://github.com/sponsors/gracefullight)
- [☕ Buy Me a Coffee](https://buymeacoffee.com/gracefullight)
- ⭐ 이 저장소에 Star를 눌러주세요:

  ```bash
  gh api --method PUT /user/starred/gracefullight/pkgs
  ```

## 라이선스

MIT
