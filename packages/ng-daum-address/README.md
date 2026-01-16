# ng-daum-address

Angular 21+를 위한 다음(카카오) 주소 검색 컴포넌트

## 설치

```bash
pnpm add @gracefullight/ng-daum-address
```

## 사용법

### Standalone Component 임포트

```typescript
import { NgDaumAddressComponent } from '@gracefullight/ng-daum-address';

@Component({
  imports: [NgDaumAddressComponent],
  // ...
})
export class YourComponent {}
```

### 템플릿에서 사용

#### Popup 모드 (기본)

```html
<ng-daum-address
  [options]="{ class: 'btn btn-primary' }"
  (result)="onAddressSelected($event)"
/>
```

#### Layer 모드

```html
<ng-daum-address
  [options]="{
    type: 'layer',
    target: 'layerTarget',
    width: 400,
    height: 500,
    border: 3,
    class: 'btn btn-secondary'
  }"
  (result)="onAddressSelected($event)"
/>
<div id="layerTarget" class="layer-container">
  <img src="//t1.daumcdn.net/postcode/resource/images/close.png" id="btnCloseLayer" alt="닫기" />
</div>
```

#### Inline 모드

```html
<ng-daum-address
  [options]="{
    type: 'inline',
    target: 'inlineTarget',
    class: 'btn btn-success'
  }"
  (result)="onAddressSelected($event)"
/>
<div id="inlineTarget" class="inline-container">
  <img src="//t1.daumcdn.net/postcode/resource/images/close.png" id="btnFoldWrap" alt="접기" />
</div>
```

### 컴포넌트에서 처리

```typescript
import type { DaumAddressResult } from '@gracefullight/ng-daum-address';

export class YourComponent {
  onAddressSelected(result: DaumAddressResult): void {
    console.log('우편번호:', result.zip);
    console.log('주소:', result.addr);
    console.log('영문주소:', result.addrEng);
  }
}
```

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `type` | `'popup' \| 'layer' \| 'inline'` | `'popup'` | 표시 방식 |
| `class` | `string \| string[]` | - | 버튼 CSS 클래스 |
| `target` | `string` | - | layer/inline 모드시 타겟 요소 ID |
| `width` | `number` | `400` | layer 모드시 가로 크기 |
| `height` | `number` | `500` | layer 모드시 세로 크기 |
| `border` | `number` | `5` | layer 모드시 테두리 크기 |
| `buttonText` | `string` | `'주소 검색'` | 버튼 텍스트 |
| `debug` | `boolean` | `false` | 디버그 모드 활성화 |

## 결과 데이터 (DaumAddressResult)

| 필드 | 타입 | 설명 |
|------|------|------|
| `zip` | `string` | 우편번호 (5자리) |
| `addr` | `string` | 전체 주소 (한글) |
| `addrEng` | `string` | 전체 주소 (영문) |
| `roadAddress` | `string` | 도로명 주소 |
| `jibunAddress` | `string` | 지번 주소 |
| `buildingName` | `string` | 건물명 |
| `apartment` | `'Y' \| 'N'` | 아파트 여부 |
| `sido` | `string` | 시도 |
| `sigungu` | `string` | 시군구 |
| `bname` | `string` | 법정동/리 |

## 라이선스

MIT
