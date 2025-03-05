export interface Provider {
  providerId: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  biography: string;
  qualifications: string;
  qualificationsExtended: string;
  shortDescription: string;
  specialties: string[];
  fee: number | null;
  type: string;
  location: {
    city: string;
    country: string;
  };
  bookingMediums: {
    video: boolean;
    phone: boolean;
    inPerson: boolean;
  };
}

export interface ProviderDetails {
  availableDates: string[];
  availableTimes: string[];
  specialties: string[];
  bookingTypesAvailable: string[];
  domains: string[];
  biography: string;
  qualifications: string;
  qualificationsExtended: string;
  shortDescription: string;
  fee: number;
  isWellbeingV2Enabled: boolean;
  hasSetAvailability: boolean;
  postCode: string | null;
  country: string | null;
  providerId: string;
  firstName: string;
  lastName: string;
  calendarID: number;
  type: string;
  avatar: string | null;
  address: string;
  address2: string | null;
  suburb: string;
  city: string;
  unitsPerSession: number;
  isOnboardingCompleted: boolean;
  bufferTime: string;
  sessionLeadTime: string | null;
  sessionIncrementSize: string | null;
} 