// src/app/pages/layout-principal/layout-principal.component.ts
import { Component, ViewChild, type OnInit } from "@angular/core"
import { Router, RouterModule } from "@angular/router"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { AuthService } from "../../core/services/auth.service"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-layout-principal",
  standalone: true,
  imports: [RouterModule, MatIconModule, MatButtonModule, CommonModule],
  templateUrl: "./layout-principal.component.html",
  styles: [],
  animations: [],
})
export class LayoutPrincipalComponent implements OnInit {
  sidebarAberta = true

  constructor(public router: Router, private auth: AuthService) {}

  ngOnInit() {
    // Nothing special needed for minimal layout
  }

  get userName(): string {
    return this.auth.perfil?.nome || "Usuário"
  }

  get userType(): string {
    const tipo = this.auth.perfil?.tipo;
    switch (tipo) {
      case "RESTAURANTE": return "Restaurante";
      case "FUNCIONARIO": return "FUNCIONARIO"; // Será convertido no template
      default: return "Cliente";
    }
  }

  get userAvatar(): string {
    const profileImage = this.auth.perfil?.imagem
    if (profileImage) {
      return this.auth.getAbsoluteImageUrl(profileImage)
    }
    if (this.auth.perfil?.tipo === "RESTAURANTE") {
      return "assets/png/avatar-padrao-restaurante-tavola.png"
    }
    if (this.auth.perfil?.tipo === "FUNCIONARIO") {
      return "assets/png/avatar-padrao-garcom-tavola.png"
    }
    return "assets/png/avatar-padrao-tavola-cordeirinho.png"
  }

  get isCliente(): boolean {
    return this.auth.hasRole("CLIENTE")
  }

  get isRestaurante(): boolean {
    return this.auth.hasRole("RESTAURANTE")
  }

  get isFuncionario(): boolean {
    return this.auth.hasRole("FUNCIONARIO")
  }

  handleSidebarClick(event: MouseEvent) {
    if ((event.target as HTMLElement).closest("button")) return
    if (!this.sidebarAberta) this.sidebarAberta = true
  }

  toggleSidebar() {
    this.sidebarAberta = !this.sidebarAberta
  }

  logout() {
    // Minimal logout: clear auth (if available) and navigate to login
    try {
      if (this.auth && (this.auth as any).clearAuthData) (this.auth as any).clearAuthData()
    } catch {}
    this.router.navigate(["/login"])
  }

  // Many features removed for minimal layout
}
