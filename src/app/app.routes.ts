import { Routes } from '@angular/router';
import { ProviderSearchComponent } from './components/provider-search/provider-search.component';

export const routes: Routes = [
  { path: 'providers', component: ProviderSearchComponent },
  { path: '', redirectTo: '/providers', pathMatch: 'full' }
];
