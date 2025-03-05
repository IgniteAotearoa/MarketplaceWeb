import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Provider } from '../models/provider.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private apiUrl = `${environment.apiBaseUrl}/api/external/marketplace/providers`;
  private headers = new HttpHeaders().set('x-api-key', environment.apiKey);

  constructor(private http: HttpClient) {}

  getProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>(this.apiUrl, { headers: this.headers });
  }

  // Add method to get unique specialties from providers
  getSpecialties(providers: Provider[]): string[] {
    const specialtiesSet = new Set<string>();
    providers.forEach(provider => {
      provider.specialties.forEach(specialty => {
        specialtiesSet.add(specialty);
      });
    });
    return Array.from(specialtiesSet).sort();
  }
} 