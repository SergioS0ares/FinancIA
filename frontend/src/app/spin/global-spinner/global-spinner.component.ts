import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"
import { GlobalSpinnerService } from "../../core/services/global-spinner.service"

/** Tipo de spinner: 'default' (círculo), 'dots' (três bolinhas), 'custom' (conteúdo via ng-content). */
export type SpinnerType = "default" | "dots" | "custom"

@Component({
  selector: "app-global-spinner",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./global-spinner.component.html",
  styleUrls: ["./global-spinner.component.scss"],
})
export class GlobalSpinnerComponent {
  @Input() visivel = false
  @Input() fastMode = false
  @Input() darkTheme = false
  /** Tipo de spinner: default | dots | custom (use ng-content para customizar). */
  @Input() spinnerType: SpinnerType = "default"
  @Input() message = ""

  constructor(private spinnerService: GlobalSpinnerService) {
    this.spinnerService.visibilidade$.subscribe((v: boolean) => (this.visivel = v))
  }
}
