import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Provider, ProviderDetails } from '../models/provider.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private apiUrl = `${environment.apiBaseUrl}/api/external/marketplace/providers`;
  private headers = new HttpHeaders().set('x-api-key', environment.apiKey);

  private providerTypes = [
    'Therapist',
    'Psychologist',
    'Counselor',
    'Life Coach',
    'Career Coach',
    'Wellness Coach',
    'Mental Health Coach'
  ];

  private cities = [
    'Auckland',
    'Wellington',
    'Christchurch',
    'Hamilton',
    'Tauranga',
    'Dunedin',
    'Palmerston North',
    'Napier',
    'Nelson',
    'Rotorua'
  ];

  private countries = ['New Zealand'];

  constructor(private http: HttpClient) {}

  private getRandomType(): string {
    const randomIndex = Math.floor(Math.random() * this.providerTypes.length);
    return this.providerTypes[randomIndex];
  }

  private getRandomLocation(): { city: string; country: string } {
    const randomCityIndex = Math.floor(Math.random() * this.cities.length);
    return {
      city: this.cities[randomCityIndex],
      country: this.countries[0] // For now, just using NZ
    };
  }

  private getRandomBookingMediums(): { video: boolean; phone: boolean; inPerson: boolean } {
    // Ensure at least one booking medium is true
    const video = Math.random() > 0.3;
    const phone = Math.random() > 0.3;
    const inPerson = !video && !phone ? true : Math.random() > 0.3;

    return {
      video,
      phone,
      inPerson
    };
  }

  getProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>(this.apiUrl, { headers: this.headers }).pipe(
      map(providers => providers.map(provider => ({
        ...provider,
        location: this.getRandomLocation(),
        type: this.getRandomType(),
        bookingMediums: this.getRandomBookingMediums()
      })))
    );
  }

  getProvider(id: string): Observable<ProviderDetails> {
    return this.http.get<ProviderDetails>(`${this.apiUrl}/${id}/availability`, { headers: this.headers }).pipe(
      map(provider => {
        const location = this.getRandomLocation();
        return {
          ...provider,
          type: this.getRandomType(),
          city: location.city,
          country: location.country,
          bookingTypesAvailable: Object.entries(this.getRandomBookingMediums())
            .filter(([_, value]) => value)
            .map(([key, _]) => key.charAt(0).toUpperCase() + key.slice(1))
        };
      })
    );
  }

  getSpecialties(providers: Provider[]): string[] {
    const specialtiesSet = new Set<string>();
    providers.forEach(provider => {
      provider.specialties.forEach(specialty => {
        specialtiesSet.add(specialty);
      });
    });
    return Array.from(specialtiesSet).sort();
  }

  getAvailableTimes(providerId: string, date: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiBaseUrl}/api/external/marketplace/providers/${providerId}/times`, {
      headers: this.headers,
      params: { date }
    });
  }
} 