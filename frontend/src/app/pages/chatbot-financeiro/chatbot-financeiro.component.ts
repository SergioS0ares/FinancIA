import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-chatbot-financeiro',
  standalone: true,
  imports: [MatIconModule, MatInputModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './chatbot-financeiro.component.html',
  styleUrl: './chatbot-financeiro.component.scss',
})
export class ChatbotFinanceiroComponent {}
