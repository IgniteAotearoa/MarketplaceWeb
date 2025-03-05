import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderService } from '../../services/provider.service';
import { Provider } from '../../models/provider.interface';

@Component({
  selector: 'app-provider-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './provider-search.component.html',
  styleUrl: './provider-search.component.sass'
})
export class ProviderSearchComponent implements OnInit {
  providers: Provider[] = [];
  filteredProviders: Provider[] = [];
  specialties: string[] = [];
  selectedSpecialties: Set<string> = new Set();
  loading = true;
  error: string | null = null;

  constructor(private providerService: ProviderService) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  private loadProviders(): void {
    this.loading = true;
    this.providerService.getProviders().subscribe({
      next: (providers) => {
        this.providers = providers;
        this.filteredProviders = providers;
        this.specialties = this.providerService.getSpecialties(providers);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load providers. Please try again later.';
        this.loading = false;
        console.error('Error loading providers:', error);
      }
    });
  }

  toggleSpecialty(specialty: string): void {
    if (this.selectedSpecialties.has(specialty)) {
      this.selectedSpecialties.delete(specialty);
    } else {
      this.selectedSpecialties.add(specialty);
    }
    this.applyFilters();
  }

  private applyFilters(): void {
    if (this.selectedSpecialties.size === 0) {
      this.filteredProviders = this.providers;
      return;
    }

    this.filteredProviders = this.providers.filter(provider =>
      provider.specialties.some(specialty => this.selectedSpecialties.has(specialty))
    );
  }
}
