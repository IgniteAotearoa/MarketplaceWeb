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
} 