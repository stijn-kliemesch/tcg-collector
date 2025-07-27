export interface Card {
  id: string;
  name: string;
  set: string;
  condition: string;
  quantity: number;
  tags: string[];
  notes?: string;
  dateAdded: string;
}
