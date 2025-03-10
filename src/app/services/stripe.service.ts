import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface AppointmentRequestDTO {
  firstName: string;
  lastName: string;
  email: string;
  datetime: string;
  appointmentType: string;
  message?: string;
}

interface CheckoutSessionPayload {
  booking: AppointmentRequestDTO;
  providerId: string;
  successUrl: string;
  cancelUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: Promise<Stripe | null>;
  private headers = new HttpHeaders().set('X-Api-Key', environment.apiKey);

  constructor(private http: HttpClient) {
    this.stripe = loadStripe(environment.stripe.publishableKey);
  }

  // Create a checkout session
  createCheckoutSession(payload: CheckoutSessionPayload): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/external/marketplace/checkout-session`, 
      payload,
      { headers: this.headers }
    );
  }

  // Redirect to Stripe Checkout
  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.stripe;
    if (!stripe) {
      throw new Error('Stripe.js failed to load');
    }

    const result = await stripe.redirectToCheckout({
      sessionId: sessionId
    });

    if (result.error) {
      throw result.error;
    }
  }
} 