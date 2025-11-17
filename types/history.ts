export interface HistoryItem {
  id: number;
  name: string;
  imageUrl: string | null;
  parkingTime: number | null;
  parkingType: string | null;
  totalPrice: number;
  createdAt: string;
}
