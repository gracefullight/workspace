# @gracefullight/react-share

A lightweight, headless social sharing library for React. Highly customizable and supports multiple platforms with a strategy-based architecture.

## Features

- 🧩 **Headless**: Total control over your UI. Use your own buttons, icons, and styles.
- 🚀 **Performance**: SDKs (Kakao, Facebook) are loaded only when needed.
- 🛠 **Strategy Pattern**: Easy to extend or modify sharing logic for any platform.
- 📱 **Native Share**: Built-in support for the Web Share API.
- 🔗 **Dynamic URLs**: Supports async URL resolution (e.g., fetching a short link when the button is clicked).

## Architecture

```mermaid
flowchart TD
    User[👤 User Action<br/>Click Share Button] --> Hook[⚛️ useHeadlessShare Hook<br/>State Management & SDK Loading]
    Hook --> Registry[📋 Strategy Registry<br/>Map<platform, ShareStrategy>]
    Registry --> Strategy{Platform Strategy}
    
    Strategy -->|SDK Lazy Load| Kakao[KakaoStrategy]
    Strategy -->|SDK Lazy Load| Facebook[FacebookStrategy]
    Strategy -->|Direct URL| Direct[Direct URL Strategies<br/>Twitter, Pinterest, etc.]
    Strategy -->|Web Share API| Native[NativeStrategy]
    Strategy -->|Clipboard| Link[LinkStrategy]
    Strategy -->|Custom| Custom[Custom Strategy<br/>registerShareStrategy()]
    
    Kakao --> Exec[🚀 Share Execution]
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

The library uses a **Strategy Pattern** for platform-specific implementations:

1. **Hook Layer**: `useHeadlessShare` manages state and SDK loading
2. **Strategy Registry**: Maps platforms to their respective strategies
3. **Platform Strategies**: SDK-based (Kakao, Facebook), Direct URL (Twitter, etc.), Native (Web Share API), or Clipboard
4. **Extensible**: Register custom strategies via `registerShareStrategy()`

## Supported Platforms

- Kakao
- Facebook
- Twitter
- Pinterest
- WhatsApp
- Line
- Threads
- Native (Web Share API)
- Link Copy (Clipboard)

## Installation

```bash
npm install @gracefullight/react-share
# or
bun add @gracefullight/react-share
```

## Basic Usage

### Using the Component (Recommended)

The `HeadlessShareButton` component handles the complexities of SDK loading and URL resolution.

```tsx
import { HeadlessShareButton } from '@gracefullight/react-share';

function MyShareComponent() {
  return (
    <HeadlessShareButton
      type="twitter"
      data={{
        id: "recipe-123",
        title: "Delicious Pasta",
        description: "Check out this amazing recipe!",
        url: "https://pic2cook.com/recipe/123",
      }}
    >
      {({ onClick, isLoading }) => (
        <button onClick={onClick} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Share on Twitter'}
        </button>
      )}
    </HeadlessShareButton>
  );
}
```

### Using the Hook

For more advanced control, you can use the `useHeadlessShare` hook directly.

```tsx
import { useHeadlessShare } from '@gracefullight/react-share';

function CustomShare() {
  const { share, isSdkReady } = useHeadlessShare({
    type: 'facebook',
    options: {
      facebook: { appId: 'YOUR_APP_ID' }
    },
    onShareError: (err) => console.error(err),
  });

  return (
    <button onClick={() => share({ url: '...' })} disabled={!isSdkReady}>
      Share
    </button>
  );
}
```

## Advanced: Dynamic URLs

If you need to fetch a shareable URL only when the user clicks the button:

```tsx
<HeadlessShareButton
  data={{
    id: "1",
    title: "Recipe",
    url: async () => {
      const response = await fetch('/api/get-short-url');
      const data = await response.json();
      return data.url;
    }
  }}
  // ...
/>
```

## Comparison with Other Libraries

| Feature | Traditional Libraries | @gracefullight/react-share |
|---------|----------------------|---------------------------|
| **Architecture** | Component-based | Headless (render props) |
| **UI Control** | Limited (pre-built buttons/icons) | Full control (bring your own UI) |
| **Bundle Size** | Larger (includes SVG icons) | Smaller (no icons included) |
| **Dynamic URLs** | Partial (beforeOnClick) | Full (async URL resolver) |
| **SDK Loading** | None (popup-based) | Lazy-loaded (Kakao, Facebook) |
| **Type Safety** | Basic | Discriminated unions |
| **Customization** | Style props | Complete UI freedom |
| **Design System** | Hard to integrate | Seamless integration |

## Support Development

If you find this library helpful, please consider supporting:

- [♥ GitHub Sponsors](https://github.com/sponsors/gracefullight)
- [☕ Buy Me a Coffee](https://buymeacoffee.com/gracefullight)
- ⭐ Star this repository:

  ```bash
  gh api --method PUT /user/starred/gracefullight/pkgs
  ```

## License

MIT
