import { Routes } from '@angular/router';
import { ProviderSearchComponent } from './components/provider-search/provider-search.component';
import { ProviderDetailsComponent } from './components/provider-details/provider-details.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { PaymentCancelledComponent } from './components/payment-cancelled/payment-cancelled.component';

export const routes: Routes = [
  { path: 'providers', component: ProviderSearchComponent },
  { path: 'provider/:id', component: ProviderDetailsComponent },
  { path: 'payment-success', component: PaymentSuccessComponent },
  { path: 'payment-cancelled', component: PaymentCancelledComponent },
  { path: '', redirectTo: '/providers', pathMatch: 'full' }
];
