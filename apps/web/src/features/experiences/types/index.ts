export interface Experience {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
  images: string[];
  location: {
    lat: number;
    lng: number;
  };
  availability: {
    startDate: string;
    endDate: string;
    spotsRemaining: number;
  };
}