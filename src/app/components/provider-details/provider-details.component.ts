import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProviderService } from '../../services/provider.service';
import { ProviderDetails } from '../../models/provider.interface';

@Component({
  selector: 'app-provider-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './provider-details.component.html',
  styleUrl: './provider-details.component.sass'
})
export class ProviderDetailsComponent implements OnInit {
  provider: ProviderDetails | null = null;
  loading = true;
  error: string | null = null;
  selectedDate: string | null = null;
  availableTimeSlots: string[] = [];
  bookingMediums: { [key: string]: boolean } = {
    video: false,
    phone: false,
    inPerson: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private providerService: ProviderService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const providerId = params['id'];
      if (providerId) {
        this.loadProvider(providerId);
      }
    });
  }

  private loadProvider(providerId: string): void {
    this.loading = true;
    this.providerService.getProvider(providerId).subscribe({
      next: (provider) => {
        this.provider = provider;
        this.updateBookingMediums();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load provider details. Please try again later.';
        this.loading = false;
        console.error('Error loading provider:', error);
      }
    });
  }

  private updateBookingMediums(): void {
    if (this.provider) {
      const bookingTypes = this.provider.bookingTypesAvailable;
      this.bookingMediums = {
        video: bookingTypes.includes('Video'),
        phone: bookingTypes.includes('Phone'),
        inPerson: bookingTypes.includes('In Person')
      };
    }
  }

  onDateSelect(date: string): void {
    this.selectedDate = date;
    if (this.provider) {
      // Filter time slots for the selected date
      this.availableTimeSlots = this.provider.availableTimes.filter(time => 
        time.startsWith(date.split('T')[0])
      );
    }
  }

  goBackToSearch(): void {
    this.router.navigate(['/providers']);
  }
}
