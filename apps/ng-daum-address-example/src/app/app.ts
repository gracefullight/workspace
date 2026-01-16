import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { type DaumAddressResult, NgDaumAddressComponent } from "@gracefullight/ng-daum-address";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, NgDaumAddressComponent],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {
  protected readonly title = signal("ng-daum-address-example");

  protected popupResult = signal<DaumAddressResult | null>(null);
  protected layerResult = signal<DaumAddressResult | null>(null);
  protected inlineResult = signal<DaumAddressResult | null>(null);
  protected debugResult = signal<DaumAddressResult | null>(null);

  onPopupResult(result: DaumAddressResult): void {
    this.popupResult.set(result);
  }

  onLayerResult(result: DaumAddressResult): void {
    this.layerResult.set(result);
  }

  onInlineResult(result: DaumAddressResult): void {
    this.inlineResult.set(result);
  }

  onDebugResult(result: DaumAddressResult): void {
    this.debugResult.set(result);
  }
}
