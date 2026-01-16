# ng-daum-address

Daum (Kakao) Address Search Component for Angular 21+

## Installation

```bash
pnpm add @gracefullight/ng-daum-address
```

## Usage

### Importing Standalone Component

```typescript
import { NgDaumAddressComponent } from '@gracefullight/ng-daum-address';

@Component({
  imports: [NgDaumAddressComponent],
  // ...
})
export class YourComponent {}
```

### Usage in Template

#### Popup Mode (Default)

```html
<ng-daum-address
  [options]="{ class: 'btn btn-primary' }"
  (result)="onAddressSelected($event)"
/>
```

#### Layer Mode

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
  <img src="//t1.daumcdn.net/postcode/resource/images/close.png" id="btnCloseLayer" alt="Close" />
</div>
```

#### Inline Mode

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
  <img src="//t1.daumcdn.net/postcode/resource/images/close.png" id="btnFoldWrap" alt="Fold" />
</div>
```

### Handling in Component

```typescript
import type { DaumAddressResult } from '@gracefullight/ng-daum-address';

export class YourComponent {
  onAddressSelected(result: DaumAddressResult): void {
    console.log('Zip Code:', result.zip);
    console.log('Address:', result.addr);
    console.log('Address (English):', result.addrEng);
  }
}
```

## Options

| Option | Type | Default | Description |
|------|------|--------|------|
| `type` | `'popup' \| 'layer' \| 'inline'` | `'popup'` | Display mode |
| `class` | `string \| string[]` | - | CSS class for the button |
| `target` | `string` | - | Target element ID for layer/inline modes |
| `width` | `number` | `400` | Width for layer mode |
| `height` | `number` | `500` | Height for layer mode |
| `border` | `number` | `5` | Border size for layer mode |
| `buttonText` | `string` | `'주소 검색'` | Button text (Default: 'Search Address') |
| `debug` | `boolean` | `false` | Enable debug mode |

## Result Data (DaumAddressResult)

| Field | Type | Description |
|------|------|------|
| `zip` | `string` | Zip Code (5 digits) |
| `addr` | `string` | Full Address (Korean) |
| `addrEng` | `string` | Full Address (English) |
| `roadAddress` | `string` | Road Name Address |
| `jibunAddress` | `string` | Jibun (Lot Number) Address |
| `buildingName` | `string` | Building Name |
| `apartment` | `'Y' \| 'N'` | Apartment status |
| `sido` | `string` | Sido (Province) |
| `sigungu` | `string` | Sigungu (City/County/District) |
| `bname` | `string` | Bname (Beopjeong-dong/Ri) |

## License

MIT
