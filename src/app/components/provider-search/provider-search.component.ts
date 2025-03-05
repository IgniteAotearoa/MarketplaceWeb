import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProviderService } from '../../services/provider.service';
import { Provider } from '../../models/provider.interface';

@Component({
  selector: 'app-provider-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './provider-search.component.html',
  styleUrl: './provider-search.component.sass'
})
export class ProviderSearchComponent implements OnInit {
  // Icon paths
  readonly BOOKING_ICONS = {
    video: 'assets/icons/video-icon.svg',
    phone: 'assets/icons/phone-icon.svg',
    inPerson: 'assets/icons/in-person-icon.svg'
  };

  providers: Provider[] = [];
  filteredProviders: Provider[] = [];
  specialties: string[] = [];
  selectedSpecialties = new Set<string>();
  loading = true;
  error: string | null = null;
  isSpecialtyExpanded = true;  // Start expanded by default
  isPriceExpanded = true;
  searchQuery = '';
  
  // Price filter
  priceRanges = [
    { min: 0, max: 50, label: 'Under $50' },
    { min: 50, max: 100, label: '$50 - $100' },
    { min: 100, max: 150, label: '$100 - $150' },
    { min: 150, max: Infinity, label: '$150+' }
  ];
  selectedPriceRanges = new Set<number>();

  constructor(private providerService: ProviderService) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  private loadProviders(): void {
    this.loading = true;
    this.providerService.getProviders().subscribe({
      next: (providers) => {
        this.providers = providers;
        this.filteredProviders = this.providers;
        this.specialties = this.providerService.getSpecialties(this.providers);
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

  togglePriceFilter() {
    this.isPriceExpanded = !this.isPriceExpanded;
  }

  togglePriceRange(index: number): void {
    if (this.selectedPriceRanges.has(index)) {
      this.selectedPriceRanges.delete(index);
    } else {
      this.selectedPriceRanges.add(index);
    }
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredProviders = this.providers.filter(provider => {
      const matchesSearch = !this.searchQuery || 
        provider.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        provider.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        provider.shortDescription?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        provider.specialties.some(specialty => 
          specialty.toLowerCase().includes(this.searchQuery.toLowerCase())
        );

      const matchesSpecialty = this.selectedSpecialties.size === 0 || 
        provider.specialties.some(specialty => this.selectedSpecialties.has(specialty));
      
      const matchesPrice = this.selectedPriceRanges.size === 0 ||
        Array.from(this.selectedPriceRanges).some(index => {
          const range = this.priceRanges[index];
          return provider.fee != null && provider.fee >= range.min && provider.fee < range.max;
        });

      return matchesSearch && matchesSpecialty && matchesPrice;
    });
  }

  toggleSpecialtyFilter() {
    this.isSpecialtyExpanded = !this.isSpecialtyExpanded;
  }
}
