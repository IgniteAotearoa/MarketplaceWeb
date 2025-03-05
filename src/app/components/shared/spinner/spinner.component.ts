import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [class.small]="size === 'small'">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
.spinner-container
  display: flex
  justify-content: center
  align-items: center
  padding: 2rem
  
  &.small
    padding: 1rem
    
    .spinner
      width: 24px
      height: 24px
      border-width: 2px

.spinner
  width: 40px
  height: 40px
  border: 3px solid #e2e8f0
  border-radius: 50%
  border-top-color: #2c5282
  animation: spin 1s linear infinite

@keyframes spin
  to
    transform: rotate(360deg)
  `]
})
export class SpinnerComponent {
  @Input() size: 'normal' | 'small' = 'normal';
} 