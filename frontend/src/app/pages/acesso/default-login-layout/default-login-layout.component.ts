import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"

const THEME_KEY = "app-theme"

@Component({
  selector: "app-default-login-layout",
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: "./default-login-layout.component.html",
  styleUrl: "./default-login-layout.component.scss",
})
export class DefaultLoginLayoutComponent implements OnInit {
  @Input() title = ""
  @Input() primaryBtnText = ""
  @Input() secondaryBtnText = ""
  @Input() disablePrimaryBtn = false
  @Input() primaryBtnLoading = false
  @Output() submit = new EventEmitter<void>()
  @Output() navigate = new EventEmitter<void>()

  isDark = false

  ngOnInit() {
    this.isDark = document.documentElement.classList.contains("theme-dark")
  }

  onPrimaryClick() {
    this.submit.emit()
  }

  onSecondaryClick() {
    this.navigate.emit()
  }

  toggleTheme() {
    const root = document.documentElement
    root.classList.toggle("theme-dark")
    this.isDark = root.classList.contains("theme-dark")
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(THEME_KEY, this.isDark ? "dark" : "light")
    }
  }
}