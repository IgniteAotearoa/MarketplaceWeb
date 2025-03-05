import { Routes } from '@angular/router';
import { ProviderSearchComponent } from './components/provider-search/provider-search.component';
import { ProviderDetailsComponent } from './components/provider-details/provider-details.component';

export const routes: Routes = [
  { path: 'providers', component: ProviderSearchComponent },
  { path: 'provider/:id', component: ProviderDetailsComponent },
  { path: '', redirectTo: '/providers', pathMatch: 'full' }
];
