import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-cancelled',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-cancelled.component.html',
  styleUrls: ['./payment-cancelled.component.scss']
})
export class PaymentCancelledComponent {
  constructor(private router: Router) {}

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }
} 