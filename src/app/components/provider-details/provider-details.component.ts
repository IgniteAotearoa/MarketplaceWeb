import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProviderService } from '../../services/provider.service';
import { ProviderDetails } from '../../models/provider.interface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-provider-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './provider-details.component.html',
  styleUrl: './provider-details.component.sass'
})
export class ProviderDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  provider: ProviderDetails | null = null;
  loading = true;
  error: string | null = null;
  selectedDate: string | null = null;
  selectedTime: string | null = null;
  selectedMedium: string | null = null;
  availableTimeSlots: string[] = [];
  bookingMediums: { [key: string]: boolean } = {
    video: false,
    phone: false,
    inPerson: false
  };

  // Modal state
  showBookingModal = false;
  bookingStep = 1;
  bookingForm: FormGroup;
  selectedPaymentOption: 'individual' | 'employee' | 'student' | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private providerService: ProviderService,
    private formBuilder: FormBuilder
  ) {
    this.bookingForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const providerId = params['id'];
        if (providerId) {
          this.loadProvider(providerId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProvider(providerId: string): void {
    this.loading = true;
    this.providerService.getProvider(providerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
        inPerson: bookingTypes.includes('InPerson')
      };
    }
  }

  onMediumSelect(medium: string): void {
    this.selectedMedium = medium;
  }

  onDateSelect(date: string): void {
    this.selectedDate = date;
    this.selectedTime = null;
    if (this.provider) {
      // Filter time slots for the selected date
      this.availableTimeSlots = this.provider.availableTimes.filter(time => 
        time.startsWith(date.split('T')[0])
      );
    }
  }

  onTimeSelect(time: string): void {
    this.selectedTime = time;
  }

  get canBook(): boolean {
    return !!this.selectedMedium && !!this.selectedDate && !!this.selectedTime;
  }

  openBookingModal(): void {
    this.showBookingModal = true;
    this.bookingStep = 1;
    this.selectedPaymentOption = null;
    this.bookingForm.reset();
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.bookingStep = 1;
    this.selectedPaymentOption = null;
    this.bookingForm.reset();
  }

  nextStep(): void {
    if (this.bookingStep === 1 && this.bookingForm.valid) {
      this.bookingStep = 2;
    }
  }

  previousStep(): void {
    if (this.bookingStep === 2) {
      this.bookingStep = 1;
    }
  }

  selectPaymentOption(option: 'individual' | 'employee' | 'student'): void {
    this.selectedPaymentOption = option;
  }

  confirmBooking(): void {
    if (this.bookingForm.valid && this.selectedPaymentOption && this.provider) {
      const bookingData = {
        ...this.bookingForm.value,
        paymentOption: this.selectedPaymentOption,
        medium: this.selectedMedium,
        date: this.selectedDate,
        time: this.selectedTime,
        providerId: this.provider.providerId
      };
      
      console.log('Booking confirmed:', bookingData);
      // TODO: Implement actual booking logic here
      this.closeBookingModal();
    }
  }

  goBackToSearch(): void {
    this.router.navigate(['/providers']);
  }
}
