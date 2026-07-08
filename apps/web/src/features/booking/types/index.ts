export interface Booking {
  id: string;
  experienceId: string;
  experienceTitle: string;
  date: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  currency: string;
}