import { Component, type OnInit, type OnDestroy, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { DefaultLoginLayoutComponent } from "../default-login-layout/default-login-layout.component"
import { AcessService } from "../../../core/services/access.service"
import { ToastrService } from "ngx-toastr"
import { getApiErrorMessage } from "../../../core/utils/api-error"

@Component({
  selector: "app-verificacao-email",
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, DefaultLoginLayoutComponent],
  templateUrl: "./verificacao-email.component.html",
  styleUrls: ["./verificacao-email.component.scss"]
})
export class VerificacaoEmailComponent implements OnInit, OnDestroy {
  emailUsuario = ""
  idVerificacao = ""
  reenviarDisabilitado = false
  tempoRestante = 0
  intervalId: any
  isLoading = false
  emailEnviado = true

  private router = inject(Router);
  private loginService = inject(AcessService);
  private toastService = inject(ToastrService);

  ngOnInit(): void {
    this.emailUsuario =
      localStorage.getItem("emailCadastro") || sessionStorage.getItem("emailCadastro") || "seu-email@exemplo.com"
    this.idVerificacao = localStorage.getItem("idVerificacao") || ""
  }

  async reenviarEmail(): Promise<void> {
    if (this.reenviarDisabilitado) return

    this.isLoading = true

    try {
      this.loginService.postReenviarCodigo(this.emailUsuario).subscribe({
        next: () => {
          this.toastService.success("E-mail reenviado com sucesso!")
          this.iniciarCooldown()
        },
        error: (err: any) => {
          this.toastService.error(getApiErrorMessage(err, "Erro ao reenviar e-mail. Tente novamente."))
        },
        complete: () => {
          this.isLoading = false
        }
      })
    } catch (error) {
      this.toastService.error("Erro ao reenviar e-mail. Tente novamente.")
      this.isLoading = false
    }
  }

  private iniciarCooldown(): void {
    this.reenviarDisabilitado = true
    this.tempoRestante = 60

    this.intervalId = setInterval(() => {
      this.tempoRestante--
      if (this.tempoRestante <= 0) {
        this.reenviarDisabilitado = false
        clearInterval(this.intervalId)
      }
    }, 1000)
  }

  voltarLogin(): void {
    this.router.navigate(["/login"])
  }

  irParaConfirmacao(): void {
    if (this.idVerificacao) {
      this.router.navigate(["/confirmar-codigo/", this.idVerificacao])
    } else {
      this.toastService.error("ID de verificação não encontrado. Tente fazer o cadastro novamente.")
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }
}