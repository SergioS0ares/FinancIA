import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-planejamento-ia-proximos-passos',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './planejamento-ia-proximos-passos.component.html',
  styleUrl: './planejamento-ia-proximos-passos.component.scss',
})
export class PlanejamentoIaProximosPassosComponent {}
