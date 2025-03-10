import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProviderService } from '../../services/provider.service';
import { StripeService } from '../../services/stripe.service';
import { ProviderDetails } from '../../models/provider.interface';
import { Subject, takeUntil } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SpinnerComponent } from '../shared/spinner/spinner.component';

@Component({
  selector: 'app-provider-details',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    SpinnerComponent
  ],
  templateUrl: './provider-details.component.html',
  styleUrl: './provider-details.component.sass'
})
export class ProviderDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  availableDates: Date[] = [];
  
  provider: ProviderDetails | null = null;
  loading = true;
  loadingTimeSlots = false;
  error: string | null = null;
  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  selectedMedium: string | null = null;
  availableTimeSlots: string[] = [];
  amTimeSlots: string[] = [];
  pmTimeSlots: string[] = [];
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
    private stripeService: StripeService,
    private formBuilder: FormBuilder
  ) {
    this.bookingForm = this.formBuilder.group({
      name: ['Dan Black', Validators.required],
      email: ['devtestignite@gmail.com', [Validators.required, Validators.email]],
      phone: ['12345678', Validators.required]
    });
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    return this.availableDates.some(
      availableDate => availableDate.toDateString() === date.toDateString()
    );
  };

  onDateChange(selectedDate: Date | null): void {
    console.log('Calendar selection event:', selectedDate);
    if (!selectedDate) {
      console.log('No date selected');
      return;
    }

    if (!this.dateFilter(selectedDate)) {
      console.log('Date not available');
      return;
    }

    this.selectedDate = selectedDate;
    this.selectedTime = null;
    this.availableTimeSlots = [];

    if (this.provider?.providerId) {
      const dateString = selectedDate.toISOString().split('T')[0];
      console.log('Fetching times for date:', dateString);
      this.loadingTimeSlots = true;
      
      this.providerService.getAvailableTimes(this.provider.providerId, dateString)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (times) => {
            console.log('Raw times received:', times);
            // Format times and separate into AM/PM
            const formattedTimes = times.map(time => {
              const date = new Date(time);
              return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
            });
            
            // Separate into AM and PM arrays
            this.amTimeSlots = formattedTimes.filter(time => time.includes('AM'));
            this.pmTimeSlots = formattedTimes.filter(time => time.includes('PM'));
            
            // Sort the arrays
            this.amTimeSlots.sort();
            this.pmTimeSlots.sort();
            
            console.log('AM times:', this.amTimeSlots);
            console.log('PM times:', this.pmTimeSlots);
            this.loadingTimeSlots = false;
          },
          error: (error) => {
            console.error('Error loading available times:', error);
            this.error = 'Failed to load available times. Please try again.';
            this.loadingTimeSlots = false;
          }
        });
    } else {
      console.log('No provider ID available');
    }
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
          // Convert available dates strings to Date objects
          this.availableDates = provider.availableDates.map(date => new Date(date));
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
    this.bookingForm.patchValue({
      name: 'Dan Black',
      email: 'devtestignite@gmail.com',
      phone: '12345678'
    });
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.bookingStep = 1;
    this.selectedPaymentOption = null;
    this.bookingForm.patchValue({
      name: 'Dan Black',
      email: 'devtestignite@gmail.com',
      phone: '12345678'
    });
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

  async confirmBooking(): Promise<void> {
    if (this.bookingForm.valid && this.selectedPaymentOption && this.provider) {
      const formValues = this.bookingForm.value;
      const [firstName, ...lastNameParts] = formValues.name.split(' ');
      const lastName = lastNameParts.join(' ');

      if (this.selectedPaymentOption === 'individual') {
        try {
          const appointmentRequest = {
            firstName,
            lastName,
            email: formValues.email,
            datetime: new Date(
              this.selectedDate!.getFullYear(),
              this.selectedDate!.getMonth(),
              this.selectedDate!.getDate(),
              ...this.parseTime(this.selectedTime!)
            ).toISOString(),
            appointmentType: this.selectedMedium!,
          };

          const payload = {
            booking: appointmentRequest,
            providerId: this.provider.providerId,
            successUrl: `${window.location.origin}/payment-success`,
            cancelUrl: `${window.location.origin}/payment-cancelled`,
          };

          const response = await this.stripeService.createCheckoutSession(payload).toPromise();
          await this.stripeService.redirectToCheckout(response.sessionId);
        } catch (error) {
          console.error('Error processing payment:', error);
          this.error = 'Failed to process payment. Please try again.';
        }
      } else {
        // Handle employee or student booking logic
        console.log('Booking with option:', this.selectedPaymentOption);
        this.closeBookingModal();
      }
    }
  }

  private parseTime(timeString: string): [number, number] {
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return [hours, minutes];
  }

  goBackToSearch(): void {
    this.router.navigate(['/providers']);
  }
}
